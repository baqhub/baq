/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import {
  IO,
  Record,
  RecordKey,
  RecordLink,
  RecordType,
  SchemaIO,
  VersionHash,
} from "@baqhub/sdk";

//
// Model.
//

export type ConversationRecordContent = {title?: string};

const RConversationRecordContent: IO.RType<ConversationRecordContent> =
  IO.partialObject({title: SchemaIO.string({minLength: 1, maxLength: 60})});

const [conversationRecordType, RConversationRecordType] = RecordType.full(
  "types.baq.dev",
  "c4094303fe334bd18de6a1f1929c3cad",
  "70f4a1e95d6d882698dde8f59de00f423dae9b3145246afce6ed040e3ff238e1",
  RConversationRecordContent
);

const RConversationRecord = Record.io(
  conversationRecordType,
  RConversationRecordType,
  RConversationRecordContent
);

export interface ConversationRecord
  extends IO.TypeOf<typeof RConversationRecord> {}
export const ConversationRecord =
  Record.ioClean<ConversationRecord>(RConversationRecord);
export type ConversationRecordLink = RecordLink<ConversationRecord>;
export type ConversationRecordKey = RecordKey<ConversationRecord>;
export type ConversationVersionHash = VersionHash<ConversationRecord>;
