import {AnyRecord, IO, RecordSource, RecordVersionHash} from "@baqhub/sdk";

//
// Model.
//

function cachedRecord<T extends AnyRecord>(
  recordType: IO.Type<T, unknown, unknown>
) {
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

function ofNewRecord<T extends AnyRecord>(
  ownerId: string,
  authorId: string,
  recordType: IO.Type<T, unknown, unknown>,
  record: T
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

  const patchedRecord: T = {
    ...record,
    source: RecordSource.PROXY,
    version: {
      author: record.author,
      createdAt: record.createdAt,
      receivedAt: undefined,
      hash: versionHash,
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
  ofNewRecord,
};
