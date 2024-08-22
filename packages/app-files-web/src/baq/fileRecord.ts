/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import {
  AnyBlobLink,
  IO,
  Record,
  RecordKey,
  RecordLink,
  RecordLinkOf,
  RecordType,
  SchemaIO,
  VersionHash,
} from "@baqhub/sdk";

//
// Model.
//

export type FileRecordContent = {
  blob: AnyBlobLink;
  size: number;
  parent?: RecordLinkOf<"types.baq.dev", "3050fc130d4142a9994af0ef7c89099e">;
};

const RFileRecordContent: IO.RType<FileRecordContent> = SchemaIO.object(
  {blob: AnyBlobLink.io(), size: SchemaIO.int({min: 0})},
  {parent: RecordLink.ioOf("types.baq.dev", "3050fc130d4142a9994af0ef7c89099e")}
);

const [fileRecordType, RFileRecordType] = RecordType.full(
  "types.baq.dev",
  "2b6f7bc8ffd54c8db8062700c040e04f",
  "442b85b8a5b93f6719ab65050348431028b5f58ce14ce58aa637d3f7ea964f6f",
  RFileRecordContent
);

const RFileRecord = Record.io(
  fileRecordType,
  RFileRecordType,
  RFileRecordContent
);

export interface FileRecord extends IO.TypeOf<typeof RFileRecord> {}
export const FileRecord = Record.ioClean<FileRecord>(RFileRecord);
export type FileRecordLink = RecordLink<FileRecord>;
export type FileRecordKey = RecordKey<FileRecord>;
export type FileVersionHash = VersionHash<FileRecord>;
