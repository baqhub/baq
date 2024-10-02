import {
  Q,
  QuerySortDirection,
  QuerySortProperty,
  Record,
  RecordLink,
  RecordMode,
} from "@baqhub/sdk";
import {DataProvider} from "@baqhub/sdk-react";
import {useCallback} from "react";
import {
  ConversationRecord,
  ConversationRecordKey,
} from "../baq/conversationRecord.js";
import {MessageRecord, MessageRecordKey} from "../baq/messageRecord.js";
import {useRecordsQuery} from "../baq/store.js";

//
// Model.
//

export type ItemKey = [MessageRecordKey, ConversationRecordKey];
export type GetItemKeys = DataProvider<ReadonlyArray<ItemKey>>;

//
// Hook.
//

export function useConversationsState() {
  //
  // Drafts.
  //

  const {getRecords: getDrafts} = useRecordsQuery(
    {
      pageSize: 200,
      sort: [QuerySortProperty.CREATED_AT, QuerySortDirection.DESCENDING],
      filter: Q.type(ConversationRecord),
      mode: RecordMode.LOCAL,
    },
    {mode: "local"}
  );

  const draftConversationKeys = getDrafts().map(Record.toKey);

  //
  // Synced conversations.
  //

  const {getRecords, isLoadingMore, loadMore} = useRecordsQuery({
    pageSize: 3,
    sort: [QuerySortProperty.RECEIVED_AT, QuerySortDirection.DESCENDING],
    filter: Q.type(MessageRecord),
    distinct: "content.conversation",
  });

  const getItemKeys = useCallback(
    () =>
      getRecords().map(
        (r): ItemKey => [
          Record.toKey(r),
          RecordLink.toKey(r.content.conversation),
        ]
      ),
    [getRecords]
  );

  return {
    draftConversationKeys,
    getItemKeys,
    isLoadingMore,
    loadMore,
  };
}
