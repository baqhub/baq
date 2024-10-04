import {PostRecordKey} from "@baqhub/bird-shared/baq/postRecord.js";
import {useUserProfilePageState} from "@baqhub/bird-shared/state/profilePage/userProfilePageState.js";
import {PencilSquareIcon} from "@heroicons/react/24/outline";
import {FC, Suspense} from "react";
import {PostByKey} from "../shared/post/postByKey.js";
import {EmptyPosts} from "../shared/posts/emptyPosts.js";
import {LoadingPosts} from "../shared/posts/loadingPosts.js";
import {Posts} from "../shared/posts/posts.js";
import {ProfileHeader} from "./profileHeader.js";

export const UserProfilePage: FC = () => {
  const {get, getPostKeys, isLoadingMore, loadMore} = useUserProfilePageState();
  const profile = get();
  if (!profile) {
    return "No profile";
  }

  const {entity, name, bio} = profile;
  return (
    <>
      <ProfileHeader entity={entity} name={name} bio={bio} />
      <Suspense fallback={<LoadingPosts />}>
        <Posts
          getItems={getPostKeys}
          renderItem={renderPost}
          isLoadingMore={isLoadingMore}
          loadMore={loadMore}
        >
          <EmptyPosts
            icon={<PencilSquareIcon />}
            text="You haven't posted anything!"
          />
        </Posts>
      </Suspense>
    </>
  );
};

function renderPost(postKey: PostRecordKey) {
  return <PostByKey key={postKey} postKey={postKey} />;
}
