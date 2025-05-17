import {IO} from "@baqhub/sdk";
import {KvKey, KvStoreAdapter} from "./kvStoreAdapter.js";

function ofStoreAdapter(adapter: KvStoreAdapter) {
  return {
    get: async <T>(model: IO.Type<T>, key: KvKey<T>) => {
      const value = await adapter.get<unknown>(key);
      if (typeof value === "undefined") {
        return undefined;
      }

      return IO.tryDecode(model, value);
    },

    set: async <T>(model: IO.Type<T>, key: KvKey<T>, value: T) => {
      const encoded = IO.encode(model, value);
      await adapter.set(key, encoded);
    },

    delete: adapter.delete,
  };
}

export type KvTypedStoreAdapter = ReturnType<typeof ofStoreAdapter>;

export const KvTypedStoreAdapter = {
  ofStoreAdapter,
};
