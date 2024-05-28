import {EntityLink, Record} from "@baqhub/sdk";
import {useCallback} from "react";
import {PostRecord} from "../baq/postRecord.js";
import {useFindEntityRecord, useRecordHelpers} from "../baq/store.js";

export interface Mention {
  mention: EntityLink;
  index: number;
  length: number;
}

export function usePostState(post: PostRecord) {
  const {entity, proxyEntity, updateRecords} = useRecordHelpers();
  const author = useFindEntityRecord(post.author.entity);

  if (!("text" in post.content)) {
    throw new Error("Not supported.");
  }

  if (!author) {
    throw new Error("Author entity record not found.");
  }

  // Content.
  const {text, textMentions} = post.content;
  const canActOnPost = post.author.entity !== entity && post.source !== "proxy";

  // Actions.
  const onHidePress = useCallback(() => {
    const deletedPost = Record.delete(entity, post, "local");
    updateRecords([deletedPost]);
  }, [entity, post, updateRecords]);

  const onReportPress = useCallback(() => {
    const deletedPost = Record.delete(entity, post, "report");
    updateRecords([deletedPost]);
  }, [entity, post, updateRecords]);

  return {
    proxyEntity,
    postKey: Record.toKey(post),
    authorName: author.content.profile.name,
    authorEntity: post.author.entity,
    text,
    textMentions,
    date: post.receivedAt || post.createdAt,
    canActOnPost,
    onHidePress,
    onReportPress,
  };
}
