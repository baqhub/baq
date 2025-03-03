import {KvKey, KvTypedStoreAdapter, Pod} from "@baqhub/server";
import {fetchDocumentLoader, isActor, lookupObject} from "@fedify/fedify";
import {DurableObject} from "cloudflare:workers";
import {CloudflareDurableKv} from "../../services/kv/cloudflareDurableKv2.js";
import {BaqActor} from "./baqActor.js";

const podKey: KvKey<Pod> = ["pod"];

function patchedDocumentLoader(url: string) {
  return fetchDocumentLoader(url, true);
}

export class BaqPodObject extends DurableObject {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.storage = CloudflareDurableKv.ofStorageTyped(ctx.storage);
    // this.server = Server.new({
    //   domain: Constants.domain,
    //   basePath: Constants.baqRoutePrefix,
    //   onEntityRequest,
    //   onRecordsRequest,
    //   digestStream,
    //   podMappingStore,
    //   kvStoreAdapter,
    //   blobStoreAdapter,
    //   isDev: Boolean(env.IS_DEV),
    // });

    ctx.blockConcurrencyWhile(async () => {
      this.pod = await this.storage.get(Pod.io, podKey);
    });
  }

  private storage: KvTypedStoreAdapter;
  // private server: Server;
  private pod: Pod | undefined;

  async initialize(id: string, entity: string) {
    return await this.ctx.blockConcurrencyWhile(async () => {
      if (this.pod) {
        return;
      }

      const actorIdentity = parseEntity(requestEntity);
      if (!actorIdentity) {
        return undefined;
      }

      const {server, handle, entity} = actorIdentity;
      const identifier = `${handle}@${server}`;

      const actor = await lookupObject(identifier, {
        documentLoader: patchedDocumentLoader,
      });
      if (!isActor(actor)) {
        return undefined;
      }

      const {id, preferredUsername} = actor;
      if (!id || typeof preferredUsername !== "string") {
        return undefined;
      }

      const newActor: BaqActor = {
        id: id.toString(),
        server,
        username: preferredUsername,
      };
    });
  }

  async fetch(request: Request) {
    return new Response("Hello, World!");
  }
}
