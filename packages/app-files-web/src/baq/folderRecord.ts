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
  /** Name of the folder. */
  name: string;

  /** Folder in which this folder is located. */
  parent?: RecordLinkOf<"types.baq.dev", "3050fc130d4142a9994af0ef7c89099e">;
};

const RFolderRecordContent: IO.RType<FolderRecordContent> = SchemaIO.object(
  {name: SchemaIO.string({maxLength: 100})},
  {parent: RecordLink.ioOf("types.baq.dev", "3050fc130d4142a9994af0ef7c89099e")}
);

const [folderRecordType, RFolderRecordType] = RecordType.full(
  "types.baq.dev",
  "3050fc130d4142a9994af0ef7c89099e",
  "653a33368a8feabf7f1900db569563d7ab5f5b325eeb5656cd06b26aba24b755",
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
