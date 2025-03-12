import {KvKey, KvTypedStoreAdapter, PodMapping} from "@baqhub/server";
import {DurableObject} from "cloudflare:workers";
import {CloudflareDurableKv} from "../../services/kv/cloudflareDurableKv.js";

//
// Helpers.
//

const mappingKey: KvKey<PodMapping> = ["mapping"];

//
// Durable object.
//

export class BaqPodMappingObject extends DurableObject {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.storage = CloudflareDurableKv.ofStorageTyped(ctx.storage);

    ctx.blockConcurrencyWhile(async () => {
      this.mapping = await this.storage.get(PodMapping.io, mappingKey);
    });
  }

  private storage: KvTypedStoreAdapter;
  private mapping: PodMapping | undefined;

  async initialize(entity: string, podId: string) {
    return await this.ctx.blockConcurrencyWhile(async () => {
      if (this.mapping) {
        return this.mapping.id;
      }

      const mapping: PodMapping = {
        entity,
        id: podId,
        createdAt: new Date(),
      };

      await this.storage.set(PodMapping.io, mappingKey, mapping);
      this.mapping = mapping;

      return mapping.id;
    });
  }

  async getPodId() {
    return this.mapping?.id;
  }
}

//
// Store.
//

function buildPodMappingObjectStore(
  namespace: DurableObjectNamespace<BaqPodMappingObject>
) {
  return {
    async get(entity: string) {
      const objectId = namespace.idFromName(entity);
      const object = namespace.get(objectId);

      return object.getPodId();
    },
    async initialize(entity: string, podId: string) {
      const objectId = namespace.idFromName(entity);
      const object = namespace.get(objectId);

      await object.initialize(entity, podId);
    },
  };
}

export interface PodMappingObjectStore
  extends ReturnType<typeof buildPodMappingObjectStore> {}

export const PodMappingObjectStore = {
  new: buildPodMappingObjectStore,
};
