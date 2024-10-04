import {PostVersionHash} from "@baqhub/bird-shared/baq/postRecord.js";
import {usePublicProfilePageState} from "@baqhub/bird-shared/state/profilePage/publicProfilePageState.js";
import {FaceFrownIcon} from "@heroicons/react/24/outline";
import {FC, Suspense} from "react";
import {PostByVersion} from "../shared/post/postByVersion.js";
import {EmptyPosts} from "../shared/posts/emptyPosts.js";
import {LoadingPosts} from "../shared/posts/loadingPosts.js";
import {Posts} from "../shared/posts/posts.js";
import {ProfileHeader} from "./profileHeader.js";

//
// Props.
//

interface PublicProfilePageProps {
  publicEntity: string;
}

//
// Component.
//

export const PublicProfilePage: FC<PublicProfilePageProps> = ({
  publicEntity,
}) => {
  const state = usePublicProfilePageState(publicEntity);
  const {get, getPostVersions, wrap} = state;
  const {isLoadingMore, loadMore} = state;

  const profile = get();
  if (!profile) {
    return <EmptyPosts icon={<FaceFrownIcon />} text="Profile not found..." />;
  }

  const {entity, name, bio} = profile;

  return wrap(
    <>
      <ProfileHeader entity={entity} name={name} bio={bio} />
      <Suspense fallback={<LoadingPosts />}>
        <Posts
          getItems={getPostVersions}
          renderItem={renderPost}
          isLoadingMore={isLoadingMore}
          loadMore={loadMore}
        >
          <EmptyPosts
            icon={<FaceFrownIcon />}
            text="This user hasn't posted anything!"
          />
        </Posts>
      </Suspense>
    </>
  );
};

function renderPost(postVersion: PostVersionHash) {
  return <PostByVersion key={postVersion} postVersion={postVersion} />;
}
