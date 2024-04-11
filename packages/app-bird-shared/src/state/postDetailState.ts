import {Q, Record} from "@baqhub/sdk";
import {useCallback} from "react";
import {PostRecord, PostRecordKey} from "../baq/postRecord.js";
import {
  useFindEntityRecord,
  useRecordByKey,
  useStaticRecordsQuery,
  wrapInProxyStore,
} from "../baq/store.js";

export function usePostDetailState(postKey: PostRecordKey) {
  const post = useRecordByKey(postKey);
  const author = useFindEntityRecord(post.author.entity);

  const {isLoading, getRecords} = useStaticRecordsQuery({
    pageSize: 200,
    filter: Q.and(
      Q.type(PostRecord),
      Q.record("content.replyToPost", Record.toLink(post))
    ),
    proxyTo: post.author.entity,
  });

  const getReplyVersions = useCallback(
    () => getRecords().map(Record.toVersionHash),
    [getRecords]
  );

  if (!("text" in post.content)) {
    throw new Error("Not supported.");
  }

  if (!author) {
    throw new Error("Author entity record not found.");
  }

  const {text} = post.content;
  return {
    authorName: author.content.profile.name,
    authorEntity: post.author.entity,
    text,
    date: post.receivedAt || post.createdAt,
    isLoading,
    getReplyVersions,
    wrap: wrapInProxyStore(post.author.entity),
  };
}
