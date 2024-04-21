import {PostVersionHash} from "@baqhub/app-bird-shared/build/src/baq/postRecord";
import {usePostStateByVersion} from "@baqhub/app-bird-shared/build/src/state/postStateByVersion";
import {FC} from "react";
import {Post} from "./post";

//
// Props.
//

interface PostByVersionProps {
  routePrefix: string;
  postVersion: PostVersionHash;
}

//
// Component.
//

export const PostByVersion: FC<PostByVersionProps> = props => {
  const {routePrefix, postVersion} = props;
  const state = usePostStateByVersion(postVersion);

  return <Post routePrefix={routePrefix} {...state} />;
};
