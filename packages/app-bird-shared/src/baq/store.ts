/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import {IO} from "@baqhub/sdk";
import {createStore} from "@baqhub/sdk-react";
import {PostRecord} from "./postRecord.js";
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
} = createStore(StandingRecord, PostRecord);

export type KnownRecord = IO.TypeOf<typeof RKnownRecord>;
