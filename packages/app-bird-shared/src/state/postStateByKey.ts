import {PostRecordKey} from "../baq/postRecord.js";
import {useRecordByKey} from "../baq/store.js";
import {usePostState} from "./postState.js";

export function usePostStateByKey(postKey: PostRecordKey) {
  const post = useRecordByKey(postKey);
  return usePostState(post);
}
