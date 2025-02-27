import {
  AnyBlobLink,
  AnyRecord,
  EntityRecord,
  EntityRecordSigningKey,
  Headers,
  IO,
  isDefined,
  Q,
  Query,
  QueryFilter,
  RAnyRecord,
  RecordPermissions,
  Constants as SDKConstants,
  SignAlgorithm,
  Signature,
} from "@baqhub/sdk";
import {Hono} from "hono";
import {findBlobLink} from "./helpers/recordHelpers.js";
import {BlobUpload} from "./model/blobUpload.js";
import {CachedBlob} from "./model/cachedBlob.js";
import {CachedRecord} from "./model/cachedRecord.js";
import {Pod} from "./model/pod.js";
import {PodMapping} from "./model/podMapping.js";
import {BlobStoreAdapter} from "./services/blob/blobStoreAdapter.js";
import {KvBlobUploads} from "./services/kv/kvBlobUploads.js";
import {KvCachedBlobs} from "./services/kv/kvCachedBlobs.js";
import {KvCachedRecords} from "./services/kv/kvCachedRecords.js";
import {KvPodMappings} from "./services/kv/kvPodMappings.js";
import {KvPods} from "./services/kv/kvPods.js";
import {KvStoreAdapter} from "./services/kv/kvStoreAdapter.js";

//
// Types.
//

interface BlobRequestBlob {
  type: string;
  stream: ReadableStream;
}

export interface BlobRequest {
  fileName: string;
  context: unknown;
  getBlob: () => Promise<BlobRequestBlob | undefined>;
}

export interface EntityRequestResult {
  podId: string;
  entity: string;
  name: string | undefined;
  bio: string | undefined;
  website: string | undefined;
  avatar: BlobRequest | undefined;
  createdAt: Date | undefined;
  context?: unknown;
}

export type EntityRequestHandler = (
  entity: string
) => Promise<EntityRequestResult | undefined>;

export interface RecordBuilder {
  id: string;
  createdAt: Date;
  versionCreatedAt: Date;
  type: RAnyRecord;
  build: () => Promise<AnyRecord | undefined>;
}

export interface BlobFromRequestResult {
  type: string;
  size: number;
  link: AnyBlobLink;
}

export type BlobFromRequest = (
  request: BlobRequest
) => Promise<BlobFromRequestResult | undefined>;

export interface RecordsRequestContext {
  pod: Pod;
  query: Query<AnyRecord>;
  blobFromRequest: BlobFromRequest;
}

export interface RecordsRequestResult {
  builders: ReadonlyArray<RecordBuilder>;
}

export type RecordsRequestHandler = (
  context: RecordsRequestContext
) => Promise<RecordsRequestResult>;

export interface DigestStreamResult {
  output: ReadableStream;
  hash: Promise<string>;
}

export type StreamDigester = (input: ReadableStream) => DigestStreamResult;

export interface ServerConfig {
  domain: string;
  basePath?: string;

  // Handlers.
  onEntityRequest: EntityRequestHandler;
  onRecordsRequest: RecordsRequestHandler;
  // onEntityRecordRequest?: EntityRequestHandler;
  // onRecordRequest?: RecordRequestHandler;

  // Adapters.
  digestStream: StreamDigester;
  kvStoreAdapter: KvStoreAdapter;
  blobStoreAdapter: BlobStoreAdapter;

  isDev?: boolean;
}

//
// Helpers.
//

function recordUrl(
  baseUrl: string,
  podId: string,
  authorEntity: string,
  recordId: string
) {
  return `${baseUrl}/${podId}/records/${authorEntity}/${recordId}`;
}

//
// API.
//

function buildServer(config: ServerConfig) {
  const {domain, basePath, isDev} = config;
  const {onEntityRequest, onRecordsRequest} = config;
  const {digestStream, kvStoreAdapter, blobStoreAdapter} = config;

  const baseUrl = `https://${domain}${basePath}`;

  const kvPodMappings = KvPodMappings.new(kvStoreAdapter);
  const kvPods = KvPods.new(kvStoreAdapter);
  const kvBlobUploads = KvBlobUploads.new(kvStoreAdapter);
  const kvCachedRecords = KvCachedRecords.new(kvStoreAdapter);
  const kvCachedBlobs = KvCachedBlobs.new(kvStoreAdapter);

  //
  // Blobs.
  //

  async function resolveBlobFromHash(hash: string) {
    return await kvCachedBlobs.get(hash);
  }

  async function resolveBlobFromRequest(
    request: BlobRequest
  ): Promise<BlobFromRequestResult | undefined> {
    // Upload the stream.
    const blobUpload = BlobUpload.new();
    await kvBlobUploads.set(blobUpload);

    // We want to start the request after setting the BlobUpload
    // otherwise we might deadlock requests in envs with request limits.
    const requestBlob = await request.getBlob();
    if (!requestBlob) {
      return undefined;
    }

    const digestedStream = digestStream(requestBlob.stream);
    const blobObject = await blobStoreAdapter.set(
      blobUpload.id,
      digestedStream.output
    );

    // If this blob already exists, use it.
    const hash = await digestedStream.hash;
    const existingBlob = await kvCachedBlobs.get(hash);
    if (existingBlob) {
      (async () => {
        await blobStoreAdapter.delete(blobUpload.id);
        await kvBlobUploads.delete(blobUpload.id);
      })();

      return {
        type: requestBlob.type,
        size: existingBlob.size,
        link: {
          hash: existingBlob.hash,
          type: requestBlob.type,
          name: request.fileName,
        },
      };
    }

    // Otherwise, create it.
    const newBlob: CachedBlob = {
      id: blobUpload.id,
      hash,
      size: blobObject.size,
      firstFileName: request.fileName,
      firstType: requestBlob.type,
      context: request.context,
      createdAt: new Date(),
    };

    await kvCachedBlobs.set(newBlob);
    await kvBlobUploads.delete(blobUpload.id);

    return {
      type: requestBlob.type,
      size: newBlob.size,
      link: {
        hash: newBlob.hash,
        type: requestBlob.type,
        name: request.fileName,
      },
    };
  }

  //
  // Pods.
  //

  async function resolvePod(entity: string) {
    // Find existing pod.
    const existingMap = await kvPodMappings.get(entity);
    const existingPod = existingMap && (await kvPods.get(existingMap.id));
    if (existingPod) {
      return existingPod;
    }

    // Otherwise, resolve.
    const entityResult = await onEntityRequest(entity);
    if (!entityResult) {
      return undefined;
    }

    // Create the new pod and entity record.
    const date = new Date();
    const [publicKey, privateKey] = Signature.buildKey();

    const keyPairs = [
      {
        algorithm: SignAlgorithm.ED25519,
        publicKey,
        privateKey,
      },
    ];

    const newPod: Pod = {
      id: entityResult.podId,
      entity: entityResult.entity,
      keyPairs,
      context: entityResult.context,
      createdAt: date,
      updatedAt: date,
    };

    const {avatar} = entityResult;
    const avatarBlobLink = await (async () => {
      if (!avatar) {
        return undefined;
      }

      const result = await resolveBlobFromRequest(avatar);
      if (!result) {
        return undefined;
      }

      return result.link;
    })();

    const newEntityRecord = EntityRecord.new(
      newPod.entity,
      {
        previousEntities: [],
        signingKeys: keyPairs.map(
          (kp): EntityRecordSigningKey => ({
            algorithm: kp.algorithm,
            publicKey: kp.publicKey,
          })
        ),
        servers: [
          {
            version: "1.0.0",
            preference: 0,
            endpoints: {
              auth: "",
              records: `${baseUrl}/${newPod.id}/records`,
              record: `${baseUrl}/${newPod.id}/records/{entity}/{record_id}`,
              recordVersions: `${baseUrl}/${newPod.id}/records/{entity}/{record_id}/versions`,
              recordVersion: `${baseUrl}/${newPod.id}/records/{entity}/{record_id}/versions/{version_hash}`,
              newRecord: "",
              recordBlob: `${baseUrl}/${newPod.id}/records/{entity}/{record_id}/blobs/{blob_hash}/{file_name}`,
              recordVersionBlob: `${baseUrl}/${newPod.id}/records/{entity}/{record_id}/versions/{version_hash}/blobs/{blob_hash}/{file_name}`,
              newBlob: "",
              events: "",
              newNotification: `${baseUrl}/${newPod.id}/notifications`,
              serverInfo: `${baseUrl}/${newPod.id}`,
            },
          },
        ],
        profile: {
          name: entityResult.name,
          bio: entityResult.bio,
          website: entityResult.website,
          avatar: avatarBlobLink,
        },
      },
      {
        id: newPod.id,
        createdAt: entityResult.createdAt,
        permissions: RecordPermissions.public,
      }
    );

    const newEntityCachedRecord = CachedRecord.ofNewRecord(
      newPod.id,
      newPod.id,
      EntityRecord,
      newEntityRecord
    );

    // And store it.
    await kvCachedRecords.set(EntityRecord, newEntityCachedRecord);
    await kvPods.set(newPod);

    const mapping1 = PodMapping.ofPod(newPod);
    await kvPodMappings.set(mapping1);

    if (entity !== mapping1.entity) {
      const mapping2 = PodMapping.withEntity(mapping1, entity);
      await kvPodMappings.set(mapping2);
    }

    return newPod;
  }

  //
  // Records.
  //

  async function resolveRecord(
    pod: Pod,
    authorEntity: string,
    recordId: string
  ) {
    const authorMap = await kvPodMappings.get(authorEntity);
    if (!authorMap) {
      return undefined;
    }

    // Find existing record.
    const existingRecord = await kvCachedRecords.get(
      AnyRecord,
      pod.id,
      authorMap.id,
      recordId
    );

    return existingRecord;
  }

  async function resolveRecordVersion(
    pod: Pod,
    authorEntity: string,
    recordId: string,
    versionHash: string
  ) {
    const authorMap = await kvPodMappings.get(authorEntity);
    if (!authorMap) {
      return undefined;
    }

    const existingRecordVersion = await kvCachedRecords.getVersion(
      AnyRecord,
      pod.id,
      authorMap.id,
      recordId,
      versionHash
    );

    return existingRecordVersion;
  }

  async function resolveRecordFromBuilder(pod: Pod, builder: RecordBuilder) {
    if (builder.createdAt.getTime() !== builder.versionCreatedAt.getTime()) {
      throw new Error("Note updates not yet supported.");
    }

    const existingRecord = await kvCachedRecords.get(
      AnyRecord,
      pod.id,
      pod.id,
      builder.id
    );
    if (existingRecord) {
      return existingRecord;
    }

    const newRecord = await builder.build();
    if (!newRecord) {
      return undefined;
    }

    const newCachedRecord = CachedRecord.ofNewRecord(
      pod.id,
      pod.id,
      builder.type,
      newRecord
    );
    await kvCachedRecords.set(builder.type, newCachedRecord);

    return newCachedRecord;
  }

  //
  // Routes.
  //

  type PodRoutesEnv = {
    Variables: {
      pod: Pod;
    };
  };

  type RecordRoutesEnv = PodRoutesEnv & {
    Variables: {
      record: CachedRecord<AnyRecord>;
    };
  };

  // Record + Record version routes.
  const recordCommonRoutes = new Hono<RecordRoutesEnv>();

  recordCommonRoutes.get("/", async c => {
    const {record} = c.var;
    const rawRecord = IO.encode(AnyRecord, record.record);
    const response = {
      record: rawRecord,
      linked_records: [],
    };

    return c.json(response);
  });

  recordCommonRoutes.get("/blobs/:blobHash/:fileName", async c => {
    const {record} = c.var;
    const {blobHash, fileName} = c.req.param();

    // Find a matching blob in the record.
    const blobLink = findBlobLink(record.record, blobHash, fileName);
    if (!blobLink) {
      return c.notFound();
    }
    console.log({blobLink});

    // Find the blob.
    const blob = await resolveBlobFromHash(blobHash);
    if (!blob) {
      return c.notFound();
    }

    // Serve the blob.
    const blobObject = await blobStoreAdapter.get(blob.id);
    if (!blobObject) {
      throw new Error("Blob object not found.");
    }

    const name = blobLink.name.replaceAll('"', "");

    return c.body(blobObject.body, 200, {
      "Content-Type": blobLink.type,
      "Content-Disposition": `attachment; filename="${name}"`,
      "Content-Length": blobObject.size.toString(),
      "Cache-Control": "public, max-age=31536000, immutable",
    });
  });

  // Record version.
  const recordVersionRoutes = new Hono<RecordRoutesEnv>()
    .basePath("/records/:authorEntity/:recordId/versions/:versionHash")
    .use("*", async (c, next) => {
      const {authorEntity, recordId, versionHash} = c.req.param();
      const recordVersion = await resolveRecordVersion(
        c.var.pod,
        authorEntity,
        recordId,
        versionHash
      );
      if (!recordVersion) {
        return c.notFound();
      }

      c.set("record", recordVersion);
      return next();
    })
    .route("/", recordCommonRoutes);

  // Record.
  const recordRoutes = new Hono<RecordRoutesEnv>()
    .basePath("/records/:authorEntity/:recordId")
    .use("*", async (c, next) => {
      const {authorEntity, recordId} = c.req.param();
      const record = await resolveRecord(c.var.pod, authorEntity, recordId);
      if (!record) {
        return c.notFound();
      }

      c.set("record", record);
      return next();
    })
    .route("/", recordCommonRoutes);

  // Pod.
  const podRoutes = new Hono<PodRoutesEnv>().basePath("/:podId");

  podRoutes.use("*", async (c, next) => {
    const {podId} = c.req.param();
    const pod = await kvPods.get(podId);
    if (!pod) {
      return c.notFound();
    }

    c.set("pod", pod);
    return next();
  });

  // Record query.
  podRoutes.get("/records", async c => {
    const {pod} = c.var;
    const query = Query.ofQueryParams(c.req.queries());

    // Serve entity record queries directly.
    const entityRecordFilter = Q.and(
      Q.type(EntityRecord),
      Q.author(pod.entity)
    );

    const entityRecordResponse = await (async () => {
      if (
        !query.filter ||
        !QueryFilter.isSuperset(query.filter, entityRecordFilter) ||
        !QueryFilter.isSuperset(entityRecordFilter, query.filter)
      ) {
        return undefined;
      }

      const record = await resolveRecord(pod, pod.entity, pod.id);
      if (!record) {
        return undefined;
      }

      const response = {
        page_size: query.pageSize,
        records: [IO.encode(AnyRecord, record.record)],
        linked_records: [],
      };

      return c.json(response);
    })();

    if (entityRecordResponse) {
      return entityRecordResponse;
    }

    // Otherwise, delegate to the calling code.
    const context: RecordsRequestContext = {
      pod,
      query,
      blobFromRequest: resolveBlobFromRequest,
    };

    const {builders} = await onRecordsRequest(context);
    const records = await Promise.all(
      builders.map(builder => resolveRecordFromBuilder(pod, builder))
    );

    // TODO: Directly encode the response instead.
    const rawRecords = records
      .filter(isDefined)
      .map(r => IO.encode(AnyRecord, r.record));

    const response = {
      page_size: query.pageSize,
      records: rawRecords,
      linked_records: [],
    };

    return c.json(response);
  });

  podRoutes.route("/", recordVersionRoutes);
  podRoutes.route("/", recordRoutes);

  const allRoutes = new Hono();

  // Discovery.
  allRoutes.get("/", async c => {
    const url = new URL(c.req.url);
    const entity = isDev ? "arstechnica-mastodon-social.baq.lol" : url.hostname;
    const pod = await resolvePod(entity);
    if (!pod) {
      return c.notFound();
    }

    const linkHeader = Headers.buildLink(
      recordUrl(baseUrl, pod.id, pod.entity, pod.id),
      SDKConstants.discoveryLinkRel
    );
    console.log({linkHeader});

    return c.body(null, 200, {Link: linkHeader});
  });

  allRoutes.route(basePath || "/", podRoutes);

  //
  // API.
  //

  const fetch = async (request: Request) => {
    return await allRoutes.fetch(request);
  };

  return {
    fetch,
  };
}

export const Server = {
  new: buildServer,
};
