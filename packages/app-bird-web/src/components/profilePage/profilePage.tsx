import {PostVersionHash} from "@baqhub/bird-shared/baq/postRecord.js";
import {useProfilePageState} from "@baqhub/bird-shared/state/profilePageState.js";
import {FaceFrownIcon, PencilSquareIcon} from "@heroicons/react/24/outline";
import {Route} from "@tanstack/react-router";
import {FC, Suspense} from "react";
import {appRoute} from "../app.js";
import {PostByVersion} from "../shared/post/postByVersion.js";
import {EmptyPosts} from "../shared/posts/emptyPosts.js";
import {LoadingPosts} from "../shared/posts/loadingPosts.js";
import {Posts} from "../shared/posts/posts.js";
import {ProfileHeader} from "./profileHeader.js";

//
// Component.
//

export const ProfilePage: FC = () => {
  const {entity} = profileRoute.useParams();
  const profilePageState = useProfilePageState(entity);
  const {wrap} = profilePageState;
  return (
    <Suspense fallback={<LoadingPosts />}>
      {wrap(<ProfilePageContent {...profilePageState} />)}
    </Suspense>
  );
};

const ProfilePageContent: FC<
  ReturnType<typeof useProfilePageState>
> = props => {
  const {getFull, getPostVersions} = props;
  const {onFollowClick, onUnfollowClick} = props;
  const profile = getFull();

  if (!profile) {
    return "No profile";
  }

  const renderPost = (postVersion: PostVersionHash) => (
    <PostByVersion key={postVersion} postVersion={postVersion} />
  );

  const {isOwnProfile} = profile;
  return (
    <>
      <ProfileHeader
        profile={profile}
        onFollowClick={onFollowClick}
        onUnfollowClick={onUnfollowClick}
      />
      <Suspense fallback={<LoadingPosts />}>
        <Posts getItems={getPostVersions} renderItem={renderPost}>
          {isOwnProfile ? (
            <EmptyPosts
              icon={<PencilSquareIcon />}
              text="You haven't posted anything!"
            />
          ) : (
            <EmptyPosts
              icon={<FaceFrownIcon />}
              text="This user hasn't posted anything!"
            />
          )}
        </Posts>
      </Suspense>
    </>
  );
};

//
// Route.
//

export const profileRoute = new Route({
  getParentRoute: () => appRoute,
  path: "/profile/$entity",
  component: ProfilePage,
});
