import {
  AnyBlobLink,
  AnyRecord,
  EntityRecord,
  Headers,
  IO,
  isDefined,
  RAnyRecord,
  RecordPermissions,
  RecordResponse,
  Constants as SDKConstants,
  Uuid,
} from "@baqhub/sdk";
import {Hono} from "hono";
import {findBlobLink} from "./helpers/recordHelpers.js";
import {CachedBlob} from "./model/cachedBlob.js";
import {CachedRecord} from "./model/cachedRecord.js";
import {Pod} from "./model/pod.js";
import {PodMapping} from "./model/podMapping.js";
import {BlobStoreAdapter} from "./services/blob/blobStoreAdapter.js";
import {KvCachedBlobs} from "./services/kv/kvCachedBlobs.js";
import {KvCachedRecords} from "./services/kv/kvCachedRecords.js";
import {KvPodMappings} from "./services/kv/kvPodMappings.js";
import {KvPods} from "./services/kv/kvPods.js";
import {KvStoreAdapter} from "./services/kv/kvStoreAdapter.js";

//
// Types.
//

export interface BlobRequest {
  fileName: string;
  type: string;
  size: number;
  stream: ReadableStream;
  context: unknown;
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

export type BlobFromRequest = (request: BlobRequest) => Promise<AnyBlobLink>;

export interface RecordsRequestContext {
  pod: Pod;
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
  const {domain, basePath} = config;
  const {onEntityRequest, onRecordsRequest} = config;
  const {digestStream, kvStoreAdapter, blobStoreAdapter} = config;

  const baseUrl = `https://${domain}${basePath}`;

  const kvPodMappings = KvPodMappings.new(kvStoreAdapter);
  const kvPods = KvPods.new(kvStoreAdapter);
  const kvCachedRecords = KvCachedRecords.new(kvStoreAdapter);
  const kvCachedBlobs = KvCachedBlobs.new(kvStoreAdapter);

  //
  // Blobs.
  //

  async function resolveBlobFromHash(hash: string) {
    return await kvCachedBlobs.getBlob(hash);
  }

  async function resolveBlobFromRequest(request: BlobRequest) {
    // Upload the stream.
    const blobId = Uuid.new();
    const digestedStream = digestStream(request.stream);
    const blobObject = await blobStoreAdapter.set(
      blobId,
      digestedStream.output
    );

    // If this blob already exists, use it.
    const hash = await digestedStream.hash;
    const existingBlob = await kvCachedBlobs.getBlob(hash);
    if (existingBlob) {
      await blobStoreAdapter.delete(blobId);
      return existingBlob;
    }

    // Otherwise, create it.
    const newBlob: CachedBlob = {
      id: blobId,
      hash,
      size: blobObject.size,
      firstFileName: request.fileName,
      firstType: request.type,
      context: request.context,
      createdAt: new Date(),
    };

    await kvCachedBlobs.setBlob(newBlob);
    return newBlob;
  }

  //
  // Pods.
  //

  async function resolvePod(entity: string) {
    // Find existing pod.
    const existingMap = await kvPodMappings.getPodMapping(entity);
    const existingPod = existingMap && (await kvPods.getPod(existingMap.id));
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
    const newPod: Pod = {
      id: entityResult.podId,
      entity: entityResult.entity,
      context: entityResult.context,
      createdAt: date,
      updatedAt: date,
    };

    const {avatar} = entityResult;
    const avatarBlobLink = await (async (): Promise<
      AnyBlobLink | undefined
    > => {
      if (!avatar) {
        return undefined;
      }

      const blob = await resolveBlobFromRequest(avatar);
      return {
        hash: blob.hash,
        type: avatar.type,
        name: avatar.fileName,
      };
    })();

    const newEntityRecord = EntityRecord.new(
      newPod.entity,
      {
        previousEntities: [],
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
              newNotification: "",
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
    await kvCachedRecords.setRecord(EntityRecord, newEntityCachedRecord);
    await kvPods.setPod(newPod);

    const mapping1 = PodMapping.ofPod(newPod);
    await kvPodMappings.setPodMapping(mapping1);

    if (entity !== mapping1.entity) {
      const mapping2 = PodMapping.withEntity(mapping1, entity);
      await kvPodMappings.setPodMapping(mapping2);
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
    const authorMap = await kvPodMappings.getPodMapping(authorEntity);
    if (!authorMap) {
      return undefined;
    }

    // Find existing record.
    const existingRecord = await kvCachedRecords.getRecord(
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
    const authorMap = await kvPodMappings.getPodMapping(authorEntity);
    if (!authorMap) {
      return undefined;
    }

    const existingRecordVersion = await kvCachedRecords.getRecordVersion(
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

    const existingRecord = await kvCachedRecords.getRecord(
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
    await kvCachedRecords.setRecord(builder.type, newCachedRecord);

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
    const response: RecordResponse<any, any> = {
      record: rawRecord,
      linkedRecords: [],
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
    const pod = await kvPods.getPod(podId);
    if (!pod) {
      return c.notFound();
    }

    c.set("pod", pod);
    return next();
  });

  // Record query.
  podRoutes.get("/records", async c => {
    const {pod} = c.var;

    const blobFromRequest = async (
      request: BlobRequest
    ): Promise<AnyBlobLink> => {
      const cachedBlob = await resolveBlobFromRequest(request);
      return {
        hash: cachedBlob.hash,
        type: request.type,
        name: request.fileName,
      };
    };

    const context: RecordsRequestContext = {
      pod,
      blobFromRequest,
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
      page_size: 20,
      record: rawRecords,
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
    const entity = "arstechnica.mastodon.baq.lol" || url.hostname;
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
