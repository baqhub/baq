import {getLogger} from "@logtape/logtape";

const logger = getLogger(["bridge", "cloudflare-kv"]);

export type KvKey<T> = ReadonlyArray<string> & {_t?: T};

function ofNamespace(kv: KVNamespace) {
  function keyToString(key: KvKey<any>) {
    return key.map((part: string) => part.replaceAll(":", "_:")).join("::");
  }

  return {
    async get<T>(key: KvKey<T>) {
      logger.info(`Getting key: ${key}`);

      const keyString = keyToString(key);
      const result = await kv.get<T>(keyString, "json");

      if (result === null) {
        return undefined;
      }

      return result;
    },
    async set<T>(key: KvKey<T>, value: T) {
      logger.info(`Setting key: ${key} ${value}`);

      const keyString = keyToString(key);
      const json = JSON.stringify(value);

      await kv.put(keyString, json);
    },
    async delete(key: KvKey<any>) {
      logger.info(`Deleting key: ${key}`);

      const keyString = keyToString(key);
      await kv.delete(keyString);
    },
  };
}

export const CloudflareKv = {
  ofNamespace,
};
