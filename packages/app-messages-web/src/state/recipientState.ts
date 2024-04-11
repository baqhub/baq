import {EntityRecord, Q, RecordPermissions} from "@baqhub/sdk";
import without from "lodash/without.js";
import {ConversationRecord} from "../baq/conversationRecord.js";
import {useRecordHelpers, useRecordQuery} from "../baq/store.js";

export function useRecipientDisplayName(conversation: ConversationRecord) {
  const {entity} = useRecordHelpers();
  const recipientEntity = findRecipientEntity(entity, conversation);
  const {getRecord: getRecipient} = useRecordQuery(
    {
      filter: Q.and(Q.type(EntityRecord), Q.author(recipientEntity)),
    },
    {mode: "local"}
  );

  return getRecipient()?.content.profile.name || recipientEntity;
}

export function findRecipientEntity(
  entity: string,
  {permissions}: ConversationRecord
) {
  const readEntities = RecordPermissions.toReadEntities(permissions);
  const recipientEntity = without(readEntities, entity)[0];
  if (!recipientEntity) {
    throw new Error("Invalid conversation.");
  }

  return recipientEntity;
}
