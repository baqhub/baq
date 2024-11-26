import {KvKey, KvStore} from "@fedify/fedify";
import {getLogger} from "@logtape/logtape";

const logger = getLogger(["bridge", "cloudflare-kv-store"]);

function ofNamespace(kv: KVNamespace): KvStore {
  function keyToString(key: KvKey) {
    const suffix = key
      .slice(1)
      .map((part: string) => part.replaceAll(":", "_:"))
      .join("::");

    return `fedify::${suffix}`;
  }

  return {
    async get<T = unknown>(key: KvKey) {
      logger.info(`Getting key: ${key}`);

      const keyString = keyToString(key);
      const result = await kv.get<T>(keyString, "json");

      if (result === null) {
        return undefined;
      }

      return result;
    },
    async set(key, value, options) {
      logger.info(`Setting key: ${key} ${value}`);

      const keyString = keyToString(key);
      const json = JSON.stringify(value);
      const ttl = options?.ttl?.total("seconds");

      await kv.put(keyString, json, {expirationTtl: ttl});
    },
    async delete(key) {
      logger.info(`Deleting key: ${key}`);

      const keyString = keyToString(key);
      await kv.delete(keyString);
    },
  };
}

export const CloudflareKvStore = {
  ofNamespace,
};
