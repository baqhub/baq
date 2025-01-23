import {
  AnyRecord,
  EntityRecord,
  Headers,
  IO,
  RecordPermissions,
  RecordResponse,
  Constants as SDKConstants,
  Uuid,
} from "@baqhub/sdk";
import {Hono} from "hono";
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

export interface BlobRequest {
  fileName: string;
  type: string;
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

export interface RecordsRequestResult {}

export type RecordsRequestHandler = (pod: Pod) => Promise<RecordsRequestResult>;

export interface DigestStreamResult {
  output: ReadableStream;
  getDigest: () => string;
}

export type DigestStream = (input: ReadableStream) => DigestStreamResult;

export interface ServerConfig {
  domain: string;
  basePath?: string;

  // Handlers.
  onEntityRequest: EntityRequestHandler;
  // onEntityRecordRequest?: EntityRequestHandler;
  // onRecordRequest?: RecordRequestHandler;

  // Adapters.
  digestStream: DigestStream;
  kvStoreAdapter: KvStoreAdapter;
  blobStoreAdapter: BlobStoreAdapter;
}

function recordUrl(
  baseUrl: string,
  podId: string,
  authorEntity: string,
  recordId: string
) {
  return `${baseUrl}/${podId}/records/${authorEntity}/${recordId}`;
}

function buildServer(config: ServerConfig) {
  const {domain, basePath} = config;
  const {onEntityRequest} = config;
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
    const hash = digestedStream.getDigest();
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
      createdAt: new Date(),
      context: request.context,
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
      entityRecordId: Uuid.new(),
      context: entityResult.context,
      createdAt: date,
      updatedAt: date,
    };

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
        },
      },
      {
        id: newPod.entityRecordId,
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

    return existingRecord?.record;
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

    return existingRecordVersion?.record;
  }

  //
  // Routes.
  //

  type PodRoutesEnv = {
    Variables: {
      pod: Pod;
    };
  };

  const podRoutes = new Hono<PodRoutesEnv>();

  podRoutes.use("/:podId/*", async (c, next) => {
    const podId = c.req.param("podId");
    const pod = await kvPods.getPod(podId);
    if (!pod) {
      return c.notFound();
    }

    c.set("pod", pod);
    return next();
  });

  // Record query.
  podRoutes.get("/:podId/records", async c => {});

  // Record.
  podRoutes.get("/:podId/records/:authorEntity/:recordId", async c => {
    const authorEntity = c.req.param("authorEntity");
    const recordId = c.req.param("recordId");
    const record = await resolveRecord(c.var.pod, authorEntity, recordId);
    if (!record) {
      return c.notFound();
    }

    const rawRecord = IO.encode(AnyRecord, record);
    const response: RecordResponse<any, any> = {
      record: rawRecord,
      linkedRecords: [],
    };

    return c.json(response);
  });

  // Record version.
  podRoutes.get(
    "/:podId/records/:authorEntity/:recordId/versions/:versionHash",
    async c => {
      const authorEntity = c.req.param("authorEntity");
      const recordId = c.req.param("recordId");
      const versionHash = c.req.param("versionHash");

      const recordVersion = await resolveRecordVersion(
        c.var.pod,
        authorEntity,
        recordId,
        versionHash
      );
      if (!recordVersion) {
        return c.notFound();
      }

      const rawRecord = IO.encode(AnyRecord, recordVersion);
      const response: RecordResponse<any, any> = {
        record: rawRecord,
        linkedRecords: [],
      };

      return c.json(response);
    }
  );

  // Record blob.
  podRoutes.get(
    "/:podId/records/:authorEntity/:recordId/blobs/:blobHash/:fileName",
    async c => {}
  );

  // Record version blob.
  podRoutes.get(
    "/:podId/records/:authorEntity/:recordId/versions/:versionHash/blobs/:blobHash/:fileName",
    async c => {}
  );

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
      recordUrl(baseUrl, pod.id, pod.entity, pod.entityRecordId),
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
