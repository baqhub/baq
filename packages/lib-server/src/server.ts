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
import {CachedRecord} from "./model/cachedRecord.js";
import {Pod} from "./model/pod.js";
import {PodMapping} from "./model/podMapping.js";
import {KvCachedRecords} from "./services/kv/kvCachedRecords.js";
import {KvPodMappings} from "./services/kv/kvPodMappings.js";
import {KvPods} from "./services/kv/kvPods.js";
import {KvStoreAdapter} from "./services/kv/kvStoreAdapter.js";

export interface EntityRequestResult {
  podId: string;
  entity: string;
  name: string | undefined;
  bio: string | undefined;
  website: string | undefined;
  createdAt: Date | undefined;
  context?: unknown;
}

export type EntityRequestHandler = (
  entity: string
) => Promise<EntityRequestResult | undefined>;
// export type EntityRequestHandler = (entity: string) => void;
// export type RecordRequestHandler = (entity: string, recordId: string) => void;

export interface ServerConfig {
  domain: string;
  basePath?: string;

  // Handlers.
  onEntityRequest: EntityRequestHandler;
  // onEntityRecordRequest?: EntityRequestHandler;
  // onRecordRequest?: RecordRequestHandler;

  // Adapters.
  kvStoreAdapter: KvStoreAdapter;
  blobStoreAdapter?: undefined;
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
  const {kvStoreAdapter} = config;

  const baseUrl = `https://${domain}${basePath}`;

  const kvPodMappings = KvPodMappings.new(kvStoreAdapter);
  const kvPods = KvPods.new(kvStoreAdapter);
  const kvCachedRecords = KvCachedRecords.new(kvStoreAdapter);

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
    if (existingRecord) {
      return existingRecord.record;
    }

    // Otherwise, resolve.
    return undefined;
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
    if (!existingRecordVersion) {
      return undefined;
    }

    return existingRecordVersion.record;
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

  const allRoutes = new Hono();

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
