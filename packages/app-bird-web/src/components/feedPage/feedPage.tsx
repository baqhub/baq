import {PostRecordKey} from "@baqhub/bird-shared/baq/postRecord.js";
import {useFeedPageState} from "@baqhub/bird-shared/state/feedPageState.js";
import {UsersIcon} from "@heroicons/react/24/outline";
import {createRoute} from "@tanstack/react-router";
import {FC, Suspense} from "react";
import {appRoute} from "../app.js";
import {PostByKey} from "../shared/post/postByKey.js";
import {EmptyPosts} from "../shared/posts/emptyPosts.js";
import {LoadingPosts} from "../shared/posts/loadingPosts.js";
import {Posts} from "../shared/posts/posts.js";
import {PostComposer} from "./postComposer/postComposer.js";

//
// Component.
//

export const FeedPage: FC = () => {
  const {getPostKeys} = useFeedPageState();

  const renderPost = (postKey: PostRecordKey) => (
    <PostByKey key={postKey} postKey={postKey} />
  );

  return (
    <Suspense fallback={<LoadingPosts />}>
      <PostComposer />
      <Posts getItems={getPostKeys} renderItem={renderPost}>
        <EmptyPosts icon={<UsersIcon />} text="Follow people to see more!" />
      </Posts>
    </Suspense>
  );
};

//
// Route.
//

export const feedRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/",
  component: FeedPage,
});
