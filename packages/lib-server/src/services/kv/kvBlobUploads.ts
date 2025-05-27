import {IO} from "@baqhub/sdk";
import {BlobUpload} from "../../model/blobUpload.js";
import {KvKey, KvStoreAdapter} from "./kvStoreAdapter.js";

function blobUploadKey(blobId: string): KvKey<object> {
  return ["blob_upload", blobId];
}

function build(kv: KvStoreAdapter) {
  return {
    async get(hash: string) {
      const key = blobUploadKey(hash);
      const rawBlobUpload = await kv.get(key);
      if (!rawBlobUpload) {
        return undefined;
      }

      return IO.decode(BlobUpload.io, rawBlobUpload);
    },

    async set(blobUpload: BlobUpload) {
      const rawBlobUpload = IO.encode(BlobUpload.io, blobUpload);
      const key = blobUploadKey(blobUpload.id);
      await kv.set(key, rawBlobUpload);
    },

    async delete(blobUploadId: string) {
      const key = blobUploadKey(blobUploadId);
      await kv.delete(key);
    },
  };
}

export const KvBlobUploads = {
  new: build,
};
