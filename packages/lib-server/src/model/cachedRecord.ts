import {AnyRecord, IO, RecordSource, RecordVersionHash} from "@baqhub/sdk";
import {CachedLink} from "./cachedLink.js";
import {Pod} from "./pod.js";

//
// Model.
//

const RCachedRecord = IO.object({
  ownerId: IO.string,
  authorId: IO.string,
  id: IO.string,
  versionHash: IO.string,
  record: IO.unknown,
  links: IO.readonlyArray(CachedLink.io),
  createdAt: IO.isoDate,
});

export interface CachedRecord extends IO.TypeOf<typeof RCachedRecord> {}

//
// API.
//

function ofNewRecord<T extends AnyRecord>(
  recordType: IO.Type<T, unknown, unknown>,
  pod: Pod,
  record: T,
  links: ReadonlyArray<CachedLink>
): CachedRecord {
  const existingHash = record.version?.hash;
  const existingHashSignature = record.version?.hashSignature;
  if (existingHash || existingHashSignature) {
    throw new Error("Not a new record.");
  }

  const versionHash = RecordVersionHash.ofRecord(recordType, {
    ...record,
    version: {
      author: record.author,
      createdAt: record.createdAt,
      receivedAt: undefined,
      hash: undefined,
      hashSignature: undefined,
    },
  });

  const patchedRecord: T = {
    ...record,
    source: RecordSource.PROXY,
    receivedAt: record.createdAt,
    version: {
      author: record.author,
      createdAt: record.createdAt,
      receivedAt: record.createdAt,
      hash: versionHash,
      hashSignature: Pod.signVersionHash(pod, versionHash),
    },
  };

  return {
    ownerId: pod.id,
    authorId: pod.id,
    id: record.id,
    versionHash,
    record: IO.encode(recordType, patchedRecord),
    links,
    createdAt: record.createdAt,
  };
}

function ofExistingRecord<T extends AnyRecord>(
  recordType: IO.Type<T, unknown, unknown>,
  ownerId: string,
  authorId: string,
  record: T,
  links: ReadonlyArray<CachedLink>
) {
  const versionHash = RecordVersionHash.ofRecord(recordType, {
    ...record,
    version: {
      author: record.author,
      createdAt: record.createdAt,
      receivedAt: undefined,
      hash: undefined,
      hashSignature: undefined,
    },
  });

  const existingHash = record.version?.hash;
  const existingHashSignature = record.version?.hashSignature;
  if (!existingHash || !existingHashSignature) {
    throw new Error(
      `Bad existing record: ${existingHash} ${existingHashSignature}`
    );
  }

  if (existingHash !== versionHash) {
    throw new Error(`Version hash mismatch: ${existingHash} ${versionHash}`);
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
      hashSignature: existingHashSignature,
    },
  };

  return {
    ownerId,
    authorId,
    id: record.id,
    versionHash,
    record: IO.encode(recordType, patchedRecord),
    links,
    createdAt: new Date(),
  };
}

export const CachedRecord = {
  io: RCachedRecord,
  ofNewRecord,
  ofExistingRecord,
};
