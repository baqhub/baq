import {Headers, Constants as SDKConstants} from "@baqhub/sdk";
import {Hono} from "hono";

export type DiscoverRequestHandler = (
  entity: string
) => Promise<string | undefined>;
export type EntityRequestHandler = (entity: string) => void;
export type RecordRequestHandler = (entity: string, recordId: string) => void;

export interface ServerConfig {
  basePath?: string;

  // Handlers.
  onDiscoverRequest: DiscoverRequestHandler;
  onEntityRecordRequest?: EntityRequestHandler;
  onRecordRequest?: RecordRequestHandler;

  // Adapters.
  kvStoreAdapter?: undefined;
  blobStorageAdapter?: undefined;
}

function buildServer(config: ServerConfig) {
  const {basePath} = config;
  const {onDiscoverRequest, onEntityRecordRequest, onRecordRequest} = config;

  //
  // Routes.
  //

  const podRoutes = new Hono();

  podRoutes.get("/:podId/records/:entity/:recordId", c => {
    return c.text("hello");
  });

  podRoutes.get(
    "/:podId/records/:entity/:recordId/versions/:versionHash",
    c => {
      return c.text("hello");
    }
  );

  const allRoutes = new Hono();

  allRoutes.on("HEAD", "/", async c => {
    const url = new URL(c.req.url);
    const entity = url.hostname;
    const entityRecordPath = await onDiscoverRequest(entity);
    if (!entityRecordPath) {
      return c.notFound();
    }

    const linkHeader = Headers.buildLink(
      entityRecordPath,
      SDKConstants.discoveryLinkRel
    );

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
