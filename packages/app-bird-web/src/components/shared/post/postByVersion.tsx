import {PostVersionHash} from "@baqhub/bird-shared/baq/postRecord.js";
import {usePostStateByVersion} from "@baqhub/bird-shared/state/postStateByVersion.js";
import {FC} from "react";
import {Post} from "./post.js";

//
// Props.
//

interface PostByVersionProps {
  postVersion: PostVersionHash;
}

//
// Component.
//

export const PostByVersion: FC<PostByVersionProps> = ({postVersion}) => {
  const state = usePostStateByVersion(postVersion);
  return <Post {...state} />;
};
