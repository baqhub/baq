import {
  AnyRecord,
  CleanRecordType,
  IO,
  RecordSource,
  RecordVersionHash,
} from "@baqhub/sdk";

//
// Model.
//

function cachedRecord<T extends AnyRecord>(recordType: CleanRecordType<T>) {
  return IO.object({
    ownerId: IO.string,
    authorId: IO.string,
    record: recordType,
    createdAt: IO.isoDate,
  });
}

export type CachedRecord<T extends AnyRecord> = IO.TypeOf<
  ReturnType<typeof cachedRecord<T>>
>;

//
// API.
//

function ofRecord<T extends AnyRecord>(
  ownerId: string,
  authorId: string,
  recordType: CleanRecordType<T>,
  record: T
): CachedRecord<T> {
  const patchedRecord: T = {
    ...record,
    source: RecordSource.PROXY,
    version: {
      ...record.version,
      hash: RecordVersionHash.ofRecord(recordType, record),
    },
  };

  return {
    ownerId,
    authorId,
    record: patchedRecord,
    createdAt: new Date(),
  };
}

export const CachedRecord = {
  io: cachedRecord,
  ofRecord,
};
