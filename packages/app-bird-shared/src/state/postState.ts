import {EntityLink, Record} from "@baqhub/sdk";
import {PostRecord} from "../baq/postRecord.js";
import {useFindEntityRecord, useRecordHelpers} from "../baq/store.js";

export interface Mention {
  mention: EntityLink;
  index: number;
  length: number;
}

export function usePostState(post: PostRecord) {
  const {proxyEntity} = useRecordHelpers();
  const author = useFindEntityRecord(post.author.entity);

  if (!("text" in post.content)) {
    throw new Error("Not supported.");
  }

  if (!author) {
    throw new Error("Author entity record not found.");
  }

  const {text, textMentions} = post.content;

  return {
    proxyEntity,
    postKey: Record.toKey(post),
    authorName: author.content.profile.name,
    authorEntity: post.author.entity,
    text,
    textMentions,
    date: post.receivedAt || post.createdAt,
  };
}
