import {PostVersionHash} from "../baq/postRecord.js";
import {useRecordByVersion} from "../baq/store.js";
import {usePostState} from "./postState.js";

export function usePostStateByVersion(postVersion: PostVersionHash) {
  const post = useRecordByVersion(postVersion);
  return usePostState(post);
}
