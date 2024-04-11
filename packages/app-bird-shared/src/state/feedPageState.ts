import {Q, Record} from "@baqhub/sdk";
import {useCallback} from "react";
import {PostRecord} from "../baq/postRecord.js";
import {useRecordsQuery} from "../baq/store.js";

export function useFeedPageState() {
  const {isLoading, getRecords} = useRecordsQuery({
    pageSize: 200,
    filter: Q.and(
      Q.type(PostRecord),
      Q.or(Q.source("self"), Q.source("subscription")),
      Q.empty("content.replyToPost")
    ),
  });

  const getPostKeys = useCallback(
    () => getRecords().map(Record.toKey),
    [getRecords]
  );

  return {
    isLoading,
    getPostKeys,
  };
}
