import {Record, RecordLink} from "@baqhub/sdk";
import {useCallback} from "react";
import {MessageRecordKey} from "../baq/messageRecord.js";
import {useRecordByKey} from "../baq/store.js";
import {ConversationSelectHandler} from "./homeState.js";
import {useRecipientDisplayName} from "./recipientState.js";

export function useConversationItemState(
  messageKey: MessageRecordKey,
  onConversationSelect: ConversationSelectHandler
) {
  const {content} = useRecordByKey(messageKey);
  const conversation = useRecordByKey(RecordLink.toKey(content.conversation));
  const recipient = useRecipientDisplayName(conversation);

  const onClick = useCallback(() => {
    onConversationSelect(Record.toKey(conversation));
  }, [onConversationSelect, conversation]);

  return {
    recipient,
    lastMessage: content.text,
    onClick,
    onDeleteClick: () => {},
  };
}
