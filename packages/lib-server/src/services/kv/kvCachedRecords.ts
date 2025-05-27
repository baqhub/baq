import {IO} from "@baqhub/sdk";
import {CachedRecord} from "../../model/cachedRecord.js";
import {KvKey, KvStoreAdapter} from "./kvStoreAdapter.js";

function recordKey(
  podId: string,
  authorId: string,
  recordId: string
): KvKey<object> {
  return ["record", podId, authorId, recordId];
}

function recordVersionKey(
  podId: string,
  authorId: string,
  recordId: string,
  versionHash: string
): KvKey<object> {
  return ["record_version", podId, authorId, recordId, versionHash];
}

function entityRecordKey(podId: string, authorId: string) {
  return recordKey(podId, authorId, "entity");
}

function build(kv: KvStoreAdapter) {
  return {
    async get(podId: string, authorId: string, recordId: string) {
      const key = recordKey(podId, authorId, recordId);
      const rawRecord = await kv.get(key);
      if (!rawRecord) {
        return undefined;
      }

      return IO.decode(CachedRecord.io, rawRecord);
    },

    async getVersion(
      podId: string,
      authorId: string,
      recordId: string,
      versionHash: string
    ) {
      const key = recordVersionKey(podId, authorId, recordId, versionHash);
      const rawRecord = await kv.get(key);
      if (!rawRecord) {
        return undefined;
      }

      return IO.decode(CachedRecord.io, rawRecord);
    },

    async set(record: CachedRecord) {
      const rawRecord = IO.encode(CachedRecord.io, record);

      const key = recordKey(record.ownerId, record.authorId, record.id);
      const versionKey = recordVersionKey(
        record.ownerId,
        record.authorId,
        record.id,
        record.versionHash
      );

      const entityPromise = record.isEntityRecord
        ? kv.set(entityRecordKey(record.ownerId, record.authorId), rawRecord)
        : undefined;

      await Promise.all([
        kv.set(key, rawRecord),
        kv.set(versionKey, rawRecord),
        entityPromise,
      ]);
    },
  };
}

export const KvCachedRecords = {
  new: build,
};
