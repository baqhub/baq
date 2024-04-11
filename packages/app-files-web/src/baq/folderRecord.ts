/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import {
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

export type FolderRecordContent = {
  name: string;
  parent?: RecordLinkOf<"types.baq.dev", "3050fc130d4142a9994af0ef7c89099e">;
};

const RFolderRecordContent: IO.RType<FolderRecordContent> = SchemaIO.object(
  {name: SchemaIO.string({maxLength: 100})},
  {parent: RecordLink.ioOf("types.baq.dev", "3050fc130d4142a9994af0ef7c89099e")}
);

const [folderRecordType, RFolderRecordType] = RecordType.full(
  "types.baq.dev",
  "3050fc130d4142a9994af0ef7c89099e",
  "e8129092dd4d493b51c68e58e95d84fa67fbb0b58eafd00a11ce3ee6bc2eddd8",
  RFolderRecordContent
);

const RFolderRecord = Record.io(
  folderRecordType,
  RFolderRecordType,
  RFolderRecordContent
);

export interface FolderRecord extends IO.TypeOf<typeof RFolderRecord> {}
export const FolderRecord = Record.ioClean<FolderRecord>(RFolderRecord);
export type FolderRecordLink = RecordLink<FolderRecord>;
export type FolderRecordKey = RecordKey<FolderRecord>;
export type FolderVersionHash = VersionHash<FolderRecord>;
