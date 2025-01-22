import {
  EntityRecord,
  Headers,
  RecordPermissions,
  Constants as SDKConstants,
  Uuid,
} from "@baqhub/sdk";
import {Hono} from "hono";
import {Pod} from "./model/pod.js";
import {PodMapping} from "./model/podMapping.js";
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
  return `${baseUrl}/pods/${podId}/records/${authorEntity}/${recordId}`;
}

function buildServer(config: ServerConfig) {
  const {domain, basePath} = config;
  const {onEntityRequest} = config;
  const {kvStoreAdapter} = config;

  const baseUrl = `https://${domain}${basePath}`;

  const kvPodMappings = KvPodMappings.new(kvStoreAdapter);
  const kvPods = KvPods.new(kvStoreAdapter);

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
              records: `${baseUrl}/pods/${newPod.id}/records`,
              record: `${baseUrl}/pods/${newPod.id}/records/{entity}/{record_id}`,
              recordVersions: `${baseUrl}/pods/${newPod.id}/records/{entity}/{record_id}/versions`,
              recordVersion: `${baseUrl}/pods/${newPod.id}/records/{entity}/{record_id}/versions/{version_hash}`,
              newRecord: "",
              recordBlob: `${baseUrl}/pods/${newPod.id}/records/{entity}/{record_id}/blobs/{blob_hash}/{file_name}`,
              recordVersionBlob: `${baseUrl}/pods/${newPod.id}/records/{entity}/{record_id}/versions/{version_hash}/blobs/{blob_hash}/{file_name}`,
              newBlob: "",
              events: "",
              newNotification: "",
              serverInfo: `${baseUrl}/server`,
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

    // And store it.
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
  // Routes.
  //

  const podRoutes = new Hono();

  podRoutes.get("/pods/:podId/records/:entity/:recordId", c => {
    return c.text("hello");
  });

  podRoutes.get(
    "/pods/:podId/records/:entity/:recordId/versions/:versionHash",
    c => {
      return c.text("hello");
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
