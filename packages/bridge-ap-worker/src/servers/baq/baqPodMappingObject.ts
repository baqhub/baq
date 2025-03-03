import {KvKey, KvTypedStoreAdapter, PodMapping} from "@baqhub/server";
import {DurableObject} from "cloudflare:workers";
import {CloudflareDurableKv} from "../../services/kv/cloudflareDurableKv2.js";

//
// State.
//

const stateKey: KvKey<PodMapping> = ["state"];

//
// Durable Object.
//

export class BaqPodMappingObject extends DurableObject {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.storage = CloudflareDurableKv.ofStorageTyped(ctx.storage);

    ctx.blockConcurrencyWhile(async () => {
      this.mapping = await this.storage.get(PodMapping.io, stateKey);
    });
  }

  private storage: KvTypedStoreAdapter;
  private mapping: PodMapping | undefined;

  async getPodId() {
    return this.mapping?.id;
  }

  async setPodId(entity: string, podId: string) {
    return await this.ctx.blockConcurrencyWhile(async () => {
      if (this.mapping) {
        return this.mapping.id;
      }

      const mapping: PodMapping = {
        entity,
        id: podId,
        createdAt: new Date(),
      };

      await this.storage.set(PodMapping.io, stateKey, mapping);
      this.mapping = mapping;

      return mapping.id;
    });
  }
}
