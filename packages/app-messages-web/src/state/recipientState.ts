import {RecordPermissions} from "@baqhub/sdk";
import without from "lodash/without.js";
import {ConversationRecord} from "../baq/conversationRecord.js";
import {useFindEntityRecord, useRecordHelpers} from "../baq/store.js";

export function useRecipientDisplayName(conversation: ConversationRecord) {
  const {entity} = useRecordHelpers();
  const recipientEntity = findRecipientEntity(entity, conversation);
  const entityRecord = useFindEntityRecord(recipientEntity);
  return entityRecord?.content.profile.name || recipientEntity;
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
