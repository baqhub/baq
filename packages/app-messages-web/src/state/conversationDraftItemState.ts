import {useCallback} from "react";
import {ConversationRecordKey} from "../baq/conversationRecord.js";
import {useRecordByKey} from "../baq/store.js";
import {ConversationSelectHandler} from "./homeState.js";
import {useRecipientDisplayName} from "./recipientState.js";

export function useConversationDraftItemState(
  conversationKey: ConversationRecordKey,
  onConversationSelect: ConversationSelectHandler
) {
  const conversation = useRecordByKey(conversationKey);
  const recipient = useRecipientDisplayName(conversation);

  const onClick = useCallback(() => {
    onConversationSelect(conversationKey);
  }, [onConversationSelect, conversationKey]);

  return {
    recipient,
    onClick,
    onDeleteClick: () => {},
  };
}
