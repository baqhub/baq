import {PostRecordKey} from "@baqhub/bird-shared/baq/postRecord.js";
import {usePostStateByKey} from "@baqhub/bird-shared/state/postStateByKey.js";
import {FC} from "react";
import {Post} from "./post.js";

//
// Props.
//

interface PostByKeyProps {
  postKey: PostRecordKey;
}

//
// Component.
//

export const PostByKey: FC<PostByKeyProps> = ({postKey}) => {
  const state = usePostStateByKey(postKey);
  return <Post {...state} />;
};
