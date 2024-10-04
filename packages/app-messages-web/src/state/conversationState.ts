import {
  Q,
  QuerySortDirection,
  QuerySortProperty,
  Record,
  RecordMode,
} from "@baqhub/sdk";
import {useCallback} from "react";
import {ConversationRecordKey} from "../baq/conversationRecord.js";
import {MessageRecord} from "../baq/messageRecord.js";
import {useRecordByKey, useRecordsQuery} from "../baq/store.js";
import {useRecipientDisplayName} from "./recipientState.js";

//
// Hook.
//

export function useNonEmptyConversationState(
  conversationKey: ConversationRecordKey
) {
  const conversation = useRecordByKey(conversationKey);

  //
  // Recipient.
  //

  const recipient = useRecipientDisplayName(conversation);

  //
  // Messages.
  //

  const {getRecords, isLoadingMore, loadMore} = useRecordsQuery(
    {
      pageSize: 20,
      sort: [QuerySortProperty.RECEIVED_AT, QuerySortDirection.DESCENDING],
      filter: Q.and(
        Q.type(MessageRecord),
        Q.record("content.conversation", Record.toLink(conversation))
      ),
    },
    {mode: conversation.mode === RecordMode.LOCAL ? "local-tracked" : "fetch"}
  );

  const getMessageKeys = useCallback(() => {
    const isValidMessage = (message: MessageRecord) => {
      const versionReceivedAt = message.version?.receivedAt;
      return (
        !versionReceivedAt ||
        !conversation.receivedAt ||
        versionReceivedAt > conversation.receivedAt
      );
    };

    return getRecords().filter(isValidMessage).map(Record.toKey);
  }, [conversation, getRecords]);

  return {
    recipient,
    getMessageKeys,
    isLoadingMore,
    loadMore,
  };
}
