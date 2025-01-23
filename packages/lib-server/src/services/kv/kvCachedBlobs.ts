import {IO} from "@baqhub/sdk";
import {CachedBlob} from "../../model/cachedBlob.js";
import {KvKey, KvStoreAdapter} from "./kvStoreAdapter.js";

function blobKey(blobId: string): KvKey<object> {
  return ["blob", blobId];
}

function blobForHashKey(hash: string): KvKey<object> {
  return ["blob_by_hash", hash];
}

function build(kv: KvStoreAdapter) {
  return {
    async getBlob(hash: string) {
      const key = blobForHashKey(hash);
      const rawBlob = await kv.get(key);
      if (!rawBlob) {
        return undefined;
      }

      return IO.decode(CachedBlob.io, rawBlob);
    },

    async setBlob(blob: CachedBlob) {
      const rawBlob = IO.encode(CachedBlob.io, blob);

      const key = blobKey(blob.id);
      const hashKey = blobKey(blob.hash);

      await Promise.all([kv.set(key, rawBlob), kv.set(hashKey, rawBlob)]);
    },
  };
}

export const KvCachedBlobs = {
  new: build,
};
