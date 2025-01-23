import {AnyRecord, IO, RAnyRecord} from "@baqhub/sdk";
import {CachedRecord} from "../../model/cachedRecord.js";
import {KvStoreAdapter} from "./kvStoreAdapter.js";

function recordKey(podId: string, authorId: string, recordId: string) {
  return ["record", podId, authorId, recordId];
}

function recordVersionKey(
  podId: string,
  authorId: string,
  recordId: string,
  versionHash: string
) {
  return ["record_version", podId, authorId, recordId, versionHash];
}

function build(kv: KvStoreAdapter) {
  return {
    async getRecord<K extends RAnyRecord>(
      recordType: K,
      podId: string,
      authorId: string,
      recordId: string
    ) {
      const key = recordKey(podId, authorId, recordId);
      const rawRecord = await kv.get(key);
      if (!rawRecord) {
        return undefined;
      }

      return IO.decode(CachedRecord.io(recordType), rawRecord);
    },

    async getRecordVersion<K extends RAnyRecord>(
      recordType: K,
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

      return IO.decode(CachedRecord.io(recordType), rawRecord);
    },

    async setRecord<T extends AnyRecord>(
      recordType: IO.Type<T, unknown, unknown>,
      record: CachedRecord<T>
    ) {
      const rawRecord = IO.encode(CachedRecord.io(recordType), record);

      const key = recordKey(record.ownerId, record.authorId, record.record.id);
      const versionKey = recordVersionKey(
        record.ownerId,
        record.authorId,
        record.record.id,
        record.record.version!.hash!
      );

      await Promise.all([
        kv.set(key, rawRecord),
        kv.set(versionKey, rawRecord),
      ]);
    },
  };
}

export const KvCachedRecords = {
  new: build,
};
