import {AnyTagLink, IO} from "@baqhub/sdk";

//
// Model.
//

export enum CachedLinkType {
  TAG = "TAG",
  BLOB = "BLOB",
  ENTITY = "ENTITY",
  RECORD = "RECORD",
  VERSION = "VERSION",
}

const RTagCachedLink = IO.object({
  type: IO.literal(CachedLinkType.TAG),
  path: IO.string,
  pointer: IO.string,
  tag: AnyTagLink.io(),
});

const RBlobCachedLink = IO.object({
  type: IO.literal(CachedLinkType.BLOB),
  path: IO.string,
  pointer: IO.string,
  blobHash: IO.string,
});

const REntityCachedLink = IO.object({
  type: IO.literal(CachedLinkType.ENTITY),
  path: IO.string,
  pointer: IO.string,
  podId: IO.string,
});

const RRecordCachedLink = IO.object({
  type: IO.literal(CachedLinkType.RECORD),
  path: IO.string,
  pointer: IO.string,
  podId: IO.string,
  recordId: IO.string,
});

const RVersionCachedLink = IO.object({
  type: IO.literal(CachedLinkType.VERSION),
  path: IO.string,
  pointer: IO.string,
  podId: IO.string,
  recordId: IO.string,
  versionHash: IO.string,
});

const RCachedLink = IO.union([
  RTagCachedLink,
  RBlobCachedLink,
  REntityCachedLink,
  RRecordCachedLink,
  RVersionCachedLink,
]);

//
// Exports.
//

export type CachedLink = IO.TypeOf<typeof RCachedLink>;

export const CachedLink = {
  io: RCachedLink,
};
