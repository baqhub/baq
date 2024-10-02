import {Q, Record} from "@baqhub/sdk";
import {useCallback} from "react";
import {PostRecord} from "../baq/postRecord.js";
import {useRecordHelpers, useRecordsQuery} from "../baq/store.js";
import { BirdConstants } from "./constants.js";

export function useMentionsPageState() {
  const {entity} = useRecordHelpers();
  const {isLoading, getRecords, isLoadingMore, loadMore} = useRecordsQuery({
    pageSize: BirdConstants.listPageSize,
    filter: Q.and(
      Q.type(PostRecord),
      Q.entity("content.textMentions.*.mention", entity)
    ),
  });

  const getPostKeys = useCallback(
    () => getRecords().map(Record.toKey),
    [getRecords]
  );

  return {
    isLoading,
    getPostKeys,
    isLoadingMore,
    loadMore,
  };
}
