/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import {IO} from "@baqhub/sdk";
import {createStore} from "@baqhub/sdk-react";
import {ConversationRecord} from "./conversationRecord.js";
import {FileRecord} from "./fileRecord.js";
import {MessageRecord} from "./messageRecord.js";
import {StandingRecord} from "./standingRecord.js";

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
  useFindStandingDecision,
} = createStore(StandingRecord, ConversationRecord, MessageRecord, FileRecord);

export type KnownRecord = IO.TypeOf<typeof RKnownRecord>;
