import {RecordLink} from "@baqhub/sdk";
import {MessageRecordKey} from "../baq/messageRecord.js";
import {useRecordByKey} from "../baq/store.js";
import {useRecipientDisplayName} from "./recipientState.js";

//
// Hook.
//

export function useUnknownConversationItemState(messageKey: MessageRecordKey) {
  const {content} = useRecordByKey(messageKey);
  const conversation = useRecordByKey(RecordLink.toKey(content.conversation));
  const recipient = useRecipientDisplayName(conversation);

  return {
    recipient,
    lastMessage: content.text,
  };
}
