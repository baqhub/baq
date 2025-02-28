import {KvKey, KvStoreAdapter, KvTypedStoreAdapter} from "@baqhub/server";
import {getLogger} from "@logtape/logtape";

const logger = getLogger(["bridge", "cloudflare-kv"]);

function ofNamespace(
  kv: KVNamespace,
  prefix: ReadonlyArray<string> = []
): KvStoreAdapter {
  function keyToString(key: KvKey<any>) {
    return key.map((part: string) => part.replaceAll(":", "_:")).join("::");
  }

  return {
    async get<T>(key: KvKey<T>) {
      const fullKey = [...prefix, ...key];
      logger.info(`Getting key: ${fullKey}`);

      const keyString = keyToString(fullKey);
      const result = await kv.get<T>(keyString, "json");

      if (result === null) {
        return undefined;
      }

      return result;
    },
    async set<T>(key: KvKey<T>, value: T) {
      const fullKey = [...prefix, ...key];
      logger.info(`Setting key: ${fullKey} ${value}`);

      const keyString = keyToString(fullKey);
      const json = JSON.stringify(value);

      await kv.put(keyString, json);
    },
    async delete(key: KvKey<any>) {
      const fullKey = [...prefix, ...key];
      logger.info(`Deleting key: ${fullKey}`);

      const keyString = keyToString(fullKey);
      await kv.delete(keyString);
    },
  };
}

function typedOfNamespace(kv: KVNamespace, prefix: ReadonlyArray<string> = []) {
  const adapter = ofNamespace(kv, prefix);
  return KvTypedStoreAdapter.ofStoreAdapter(adapter);
}

export const CloudflareKv = {
  ofNamespace,
  typedOfNamespace,
};
