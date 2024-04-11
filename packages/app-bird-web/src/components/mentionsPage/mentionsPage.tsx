import {PostRecordKey} from "@baqhub/bird-shared/baq/postRecord.js";
import {useMentionsPageState} from "@baqhub/bird-shared/state/mentionsPageState.js";
import {ChatBubbleBottomCenterTextIcon} from "@heroicons/react/24/outline";
import {Route} from "@tanstack/react-router";
import {FC, Suspense} from "react";
import {appRoute} from "../app.js";
import {PostByKey} from "../shared/post/postByKey.js";
import {EmptyPosts} from "../shared/posts/emptyPosts.js";
import {LoadingPosts} from "../shared/posts/loadingPosts.js";
import {Posts} from "../shared/posts/posts.js";

//
// Component.
//

export const MentionsPage: FC = () => {
  const {getPostKeys} = useMentionsPageState();

  const renderPost = (postKey: PostRecordKey) => (
    <PostByKey key={postKey} postKey={postKey} />
  );

  return (
    <Suspense fallback={<LoadingPosts />}>
      <Posts getItems={getPostKeys} renderItem={renderPost}>
        <EmptyPosts
          icon={<ChatBubbleBottomCenterTextIcon />}
          text="You haven't been mentioned yet!"
        />
      </Posts>
    </Suspense>
  );
};

//
// Route.
//

export const mentionsRoute = new Route({
  getParentRoute: () => appRoute,
  path: "/mentions",
  component: MentionsPage,
});
