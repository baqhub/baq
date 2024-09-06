import {
  Q,
  QuerySortDirection,
  QuerySortProperty,
  Record,
  RecordLink,
} from "@baqhub/sdk";
import {useCallback, useState} from "react";
import {MessageRecord} from "../baq/messageRecord.js";
import {useRecordsQuery} from "../baq/store.js";
import {ItemKey} from "./conversationsState.js";

export function useUnknownConversationsState() {
  const {getRecords: getUnknownRecords} = useRecordsQuery({
    pageSize: 10,
    sort: [QuerySortProperty.RECEIVED_AT, QuerySortDirection.DESCENDING],
    filter: Q.type(MessageRecord),
    sources: ["notification_unknown"],
    distinct: "content.conversation",
  });

  const getUnknownCount = useCallback(
    () => getUnknownRecords().length,
    [getUnknownRecords]
  );

  const getUnknownItemKeys = useCallback(
    () =>
      getUnknownRecords().map(
        (r): ItemKey => [
          Record.toKey(r),
          RecordLink.toKey(r.content.conversation),
        ]
      ),
    [getUnknownRecords]
  );

  const [isUnknownListOpen, setIsUnknownListOpen] = useState(false);

  const onUnknownListRequest = useCallback(
    () => setIsUnknownListOpen(true),
    []
  );

  const onUnknownListRequestClose = useCallback(
    () => setIsUnknownListOpen(false),
    []
  );

  return {
    isUnknownListOpen,
    getUnknownCount,
    getUnknownItemKeys,
    onUnknownListRequest,
    onUnknownListRequestClose,
  };
}
