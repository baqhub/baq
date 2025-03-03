import {KvKey, KvStoreAdapter, KvTypedStoreAdapter} from "@baqhub/server";
import {getLogger} from "@logtape/logtape";

const logger = getLogger(["bridge", "cloudflare-durable-kv"]);

function ofStorage(storage: DurableObjectStorage): KvStoreAdapter {
  function keyToString(key: KvKey<any>) {
    return key.map((part: string) => part.replaceAll(":", "_:")).join("::");
  }

  return {
    async get<T>(key: KvKey<T>) {
      logger.info(`Getting key: ${key}`);

      const keyString = keyToString(key);
      const result = await storage.get<T>(keyString, {allowConcurrency: true});

      if (result === null) {
        return undefined;
      }

      return result;
    },
    async set<T>(key: KvKey<T>, value: T) {
      logger.info(`Setting key: ${key} ${value}`);

      const keyString = keyToString(key);
      await storage.put(keyString, value);
    },
    async delete(key: KvKey<any>) {
      logger.info(`Deleting key: ${key}`);

      const keyString = keyToString(key);
      await storage.delete(keyString);
    },
  };
}

function ofStorageTyped(storage: DurableObjectStorage) {
  const adapter = ofStorage(storage);
  return KvTypedStoreAdapter.ofStoreAdapter(adapter);
}

export const CloudflareDurableKv = {
  ofStorage,
  ofStorageTyped,
};
