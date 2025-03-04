import {SignAlgorithm, Signature} from "@baqhub/sdk";
import {BlobBuilder, KvKey, KvTypedStoreAdapter, Pod} from "@baqhub/server";
import {isActor, lookupObject} from "@fedify/fedify";
import {DurableObject} from "cloudflare:workers";
import {Constants} from "../../helpers/constants.js";
import {patchedDocumentLoader} from "../../helpers/fedify.js";
import {ActorIdentity} from "../../model/actorIdentity.js";
import {CloudflareDurableKv} from "../../services/kv/cloudflareDurableKv2.js";
import {BaqActor} from "./baqActor.js";
import {DurablePodMappingStore} from "./durablePodMappingStore.js";

const podKey: KvKey<Pod> = ["pod"];

export class BaqPodObject extends DurableObject {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);

    this.podMappingStore = DurablePodMappingStore.ofNamespace(
      env.BAQ_POD_MAPPING_OBJECT
    );
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

  private podMappingStore: DurablePodMappingStore;
  private storage: KvTypedStoreAdapter;
  // private server: Server;
  private pod: Pod | undefined;

  async initialize(id: string, requestEntity: string) {
    return await this.ctx.blockConcurrencyWhile(async () => {
      if (this.pod) {
        return;
      }

      // Discover the actor.
      const identity = ActorIdentity.ofEntity(Constants.domain, requestEntity);
      if (!identity) {
        throw new Error("Identity not found.");
      }

      const identifier = ActorIdentity.toIdentifier(identity);
      const actor = await lookupObject(identifier, {
        documentLoader: patchedDocumentLoader,
      });
      if (
        !isActor(actor) ||
        !actor.id ||
        actor.preferredUsername !== identity.handle
      ) {
        throw new Error("Invalid actor.");
      }

      // Save the new entity record.
      const avatar = await (async (): Promise<BlobBuilder | undefined> => {
        const icon = await actor.getIcon();
        if (!icon) {
          return undefined;
        }

        return avatarToBlobRequest(env, icon);
      })();

      // Save the pod.
      const newActor: BaqActor = {
        id: actor.id.toString(),
        server: identity.server,
        username: identity.handle,
      };

      const [publicKey, privateKey] = Signature.buildKey();
      const keyPairs = [
        {
          algorithm: SignAlgorithm.ED25519,
          publicKey,
          privateKey,
        },
      ];

      const date = new Date();
      const entity = ActorIdentity.toEntity(Constants.domain, identity);
      const newPod: Pod = {
        id,
        entity,
        keyPairs,
        context: newActor,
        createdAt: date,
        updatedAt: date,
      };

      await this.storage.set(Pod.io, podKey, newPod);

      // Create the mapping.
      this.podMappingStore.initialize(entity, id);
    });
  }

  async fetch(request: Request) {
    return new Response("Hello, World!");
  }
}
