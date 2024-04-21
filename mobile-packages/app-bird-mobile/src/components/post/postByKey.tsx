import {PostRecordKey} from "@protocol-apps/app-bird-shared/build/src/baq/postRecord";
import {usePostStateByKey} from "@protocol-apps/app-bird-shared/build/src/state/postStateByKey";
import {FC} from "react";
import {Post} from "./post";

//
// Props.
//

interface PostByKeyProps {
  routePrefix: string;
  postKey: PostRecordKey;
}

//
// Component.
//

export const PostByKey: FC<PostByKeyProps> = props => {
  const {routePrefix, postKey} = props;
  const state = usePostStateByKey(postKey);

  return <Post routePrefix={routePrefix} {...state} />;
};
