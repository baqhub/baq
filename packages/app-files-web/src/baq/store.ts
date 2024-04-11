/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import {IO} from "@baqhub/sdk";
import {createStore} from "@baqhub/sdk-react";
import {FileRecord} from "./fileRecord.js";
import {FolderRecord} from "./folderRecord.js";

export const {
  RKnownRecord,
  Store,
  ProxyStore,
  wrapInProxyStore,
  useRecordsQuery,
  useStaticRecordsQuery,
  useRecordQuery,
  useStaticRecordQuery,
  useRecordHelpers,
  useRecordByVersion,
  useRecordByKey,
  useFindRecordByKey,
  useFindRecordByQuery,
  useFindEntityRecord,
} = createStore(FolderRecord, FileRecord);

export type KnownRecord = IO.TypeOf<typeof RKnownRecord>;
