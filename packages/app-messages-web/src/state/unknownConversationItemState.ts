import {RecordLink} from "@baqhub/sdk";
import {useCallback} from "react";
import {MessageRecordKey} from "../baq/messageRecord.js";
import {useRecordByKey} from "../baq/store.js";
import {useRecipientDisplayName} from "./recipientState.js";

//
// Hook.
//

export function useUnknownConversationItemState(messageKey: MessageRecordKey) {
  const {receivedAt, content} = useRecordByKey(messageKey);
  const conversation = useRecordByKey(RecordLink.toKey(content.conversation));
  const recipient = useRecipientDisplayName(conversation);

  const onAcceptClick = useCallback(() => {}, []);
  const onBlockClick = useCallback(() => {}, []);

  return {
    recipient,
    date: receivedAt,
    lastMessage: content.text,
    onAcceptClick,
    onBlockClick,
  };
}
