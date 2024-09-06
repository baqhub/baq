/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import {
  IO,
  Record,
  RecordKey,
  RecordLink,
  RecordType,
  VersionHash,
} from "@baqhub/sdk";

//
// Model.
//

export type ConversationRecordContent = {};

const RConversationRecordContent: IO.RType<ConversationRecordContent> =
  IO.object({});

const [conversationRecordType, RConversationRecordType] = RecordType.full(
  "types.baq.dev",
  "7583995c51cf44ad972fdc123105e1dc",
  "e97614f368272d6d0c9c9b67173697a669f5b8ad1bc05f0a83812a8814335b50",
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
