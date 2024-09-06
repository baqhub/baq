import {RecordLink, StandingDecision} from "@baqhub/sdk";
import {useCallback} from "react";
import {MessageRecordKey} from "../baq/messageRecord.js";
import {useRecordByKey, useRecordHelpers} from "../baq/store.js";
import {
  findRecipientEntity,
  useRecipientDisplayName,
} from "./recipientState.js";

//
// Hook.
//

export function useUnknownConversationItemState(messageKey: MessageRecordKey) {
  const {receivedAt, content} = useRecordByKey(messageKey);
  const conversation = useRecordByKey(RecordLink.toKey(content.conversation));
  const recipient = useRecipientDisplayName(conversation);
  const {entity, updateStandingDecision} = useRecordHelpers();

  const onAcceptClick = useCallback(() => {
    const otherEntity = findRecipientEntity(entity, conversation);
    if (!otherEntity) {
      return;
    }

    updateStandingDecision(otherEntity, StandingDecision.ALLOW);
  }, [entity, conversation, updateStandingDecision]);
  const onBlockClick = useCallback(() => {
    const otherEntity = findRecipientEntity(entity, conversation);
    if (!otherEntity) {
      return;
    }

    updateStandingDecision(otherEntity, StandingDecision.BLOCK);
  }, [entity, conversation, updateStandingDecision]);

  return {
    recipient,
    date: receivedAt,
    lastMessage: content.text,
    onAcceptClick,
    onBlockClick,
  };
}
