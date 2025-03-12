import {AnyRecord, IO, RecordSource, RecordVersionHash} from "@baqhub/sdk";
import {CachedRecordLink} from "./cachedRecordLink.js";

//
// Model.
//

function cachedRecord<T extends AnyRecord>(
  recordType: IO.Type<T, unknown, unknown>
) {
  return IO.object({
    ownerId: IO.string,
    authorId: IO.string,
    recordId: IO.string,
    versionHash: IO.string,
    record: recordType,
    links: IO.readonlyArray(CachedRecordLink.io),
    createdAt: IO.isoDate,
  });
}

export interface CachedRecord<T extends AnyRecord>
  extends IO.TypeOf<ReturnType<typeof cachedRecord<T>>> {}

//
// API.
//

function ofNewRecord<T extends AnyRecord>(
  ownerId: string,
  authorId: string,
  recordType: IO.Type<T, unknown, unknown>,
  record: T,
  links: ReadonlyArray<CachedRecordLink>
): CachedRecord<T> {
  const versionHash = RecordVersionHash.ofRecord(recordType, {
    ...record,
    version: {
      author: record.author,
      createdAt: record.createdAt,
      receivedAt: undefined,
      hash: undefined,
    },
  });

  const existingVersionHash = record.version?.hash;
  if (existingVersionHash && existingVersionHash !== versionHash) {
    throw new Error(
      `Version hash mismatch: ${existingVersionHash} ${versionHash}`
    );
  }

  const patchedRecord: T = {
    ...record,
    source: RecordSource.PROXY,
    receivedAt: record.createdAt,
    version: {
      author: record.author,
      createdAt: record.createdAt,
      receivedAt: record.createdAt,
      hash: versionHash,
    },
  };

  return {
    ownerId,
    authorId,
    recordId: record.id,
    versionHash,
    record: patchedRecord,
    links,
    createdAt: new Date(),
  };
}

export const CachedRecord = {
  io: cachedRecord,
  ofNewRecord,
};
