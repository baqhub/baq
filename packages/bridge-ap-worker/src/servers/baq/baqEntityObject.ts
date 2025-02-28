import {IO} from "@baqhub/sdk";
import {KvKey, KvTypedStoreAdapter} from "@baqhub/server";
import {DurableObject} from "cloudflare:workers";
import {CloudflareDurableKv} from "../../services/kv/cloudflareDurableKv2.js";

//
// State.
//

const RBaqEntityState = IO.object({
  entity: IO.string,
  podId: IO.string,
});

interface BaqEntityState extends IO.TypeOf<typeof RBaqEntityState> {}

const stateKey: KvKey<BaqEntityState> = ["state"];

//
// Durable Object.
//

export class BaqEntityObject extends DurableObject {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.storage = CloudflareDurableKv.typedOfStorage(ctx.storage);

    ctx.blockConcurrencyWhile(async () => {
      this.state = await this.storage.get(RBaqEntityState, stateKey);
    });
  }

  private storage: KvTypedStoreAdapter;
  private state: BaqEntityState | undefined;

  async setPodId(entity: string, podId: string) {
    return await this.ctx.blockConcurrencyWhile(async () => {
      if (this.state) {
        return this.state.podId;
      }

      const state: BaqEntityState = {
        entity,
        podId,
      };

      await this.storage.set(RBaqEntityState, stateKey, state);
      this.state = state;

      return state.podId;
    });
  }

  async getPodId() {
    return this.state?.podId;
  }
}
