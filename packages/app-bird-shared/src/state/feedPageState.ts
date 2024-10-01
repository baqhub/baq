import {Q, Record} from "@baqhub/sdk";
import {useCallback} from "react";
import {PostRecord} from "../baq/postRecord.js";
import {useRecordsQuery} from "../baq/store.js";

export function useFeedPageState() {
  const {isLoading, canLoadMore, isLoadingMore, loadMore, getRecords} =
    useRecordsQuery({
      pageSize: 200,
      sources: ["self", "subscription"],
      filter: Q.and(Q.type(PostRecord), Q.empty("content.replyToPost")),
      includeLinks: ["entity", "existential", "standing"],
    });

  const getPostKeys = useCallback(
    () => getRecords().map(Record.toKey),
    [getRecords]
  );

  return {
    isLoading,
    canLoadMore,
    isLoadingMore,
    loadMore,
    getPostKeys,
  };
}
