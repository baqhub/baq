import {BlobStoreAdapter} from "@baqhub/server";
import {getLogger} from "@logtape/logtape";

const logger = getLogger(["bridge", "cloudflare-blob"]);

function ofBucket(bucket: R2Bucket): BlobStoreAdapter {
  return {
    async get(key) {
      logger.info(`Getting blob: ${key}`);

      const obj = await bucket.get(key);
      if (!obj) {
        return undefined;
      }

      return {
        key: obj.key,
        size: obj.size,
        body: obj.body,
      };
    },
    async set(key, stream) {
      logger.info(`Setting blob: ${key}`);

      const obj = await bucket.put(key, stream);
      if (!obj) {
        throw new Error("Upload failed.");
      }

      return {
        key: obj.key,
        size: obj.size,
      };
    },
    async delete(key) {
      logger.info(`Deleting blob: ${key}`);
      await bucket.delete(key);
    },
  };
}

export const CloudflareBlob = {
  ofBucket,
};
