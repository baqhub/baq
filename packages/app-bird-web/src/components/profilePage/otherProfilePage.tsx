import {PostVersionHash} from "@baqhub/bird-shared/baq/postRecord.js";
import {useOtherProfilePageState} from "@baqhub/bird-shared/state/profilePage/otherProfilePageState.js";
import {Button} from "@baqhub/ui/core/button.js";
import {Grid, tw} from "@baqhub/ui/core/style.js";
import {FaceFrownIcon} from "@heroicons/react/24/outline";
import {useNavigate} from "@tanstack/react-router";
import {FC, Suspense} from "react";
import {PostByVersion} from "../shared/post/postByVersion.js";
import {EmptyPosts} from "../shared/posts/emptyPosts.js";
import {LoadingPosts} from "../shared/posts/loadingPosts.js";
import {Posts} from "../shared/posts/posts.js";
import {ProfileHeader} from "./profileHeader.js";

//
// Props.
//

interface OtherProfilePageProps {
  otherEntity: string;
}

//
// Style.
//

const ProfileButtons = tw(Grid)`
  grid-flow-col
  auto-cols-fr
  gap-2
  py-2
`;

//
// Component.
//

export const OtherProfilePage: FC<OtherProfilePageProps> = ({otherEntity}) => {
  const state = useOtherProfilePageState(otherEntity);
  const {getFull, getPostVersions, wrap} = state;
  const {onFollowClick, onUnfollowClick} = state;
  const {onBlockClick, onUnblockClick} = state;

  const navigate = useNavigate();

  const profile = getFull();
  if (!profile) {
    return <EmptyPosts icon={<FaceFrownIcon />} text="Profile not found..." />;
  }

  const {entity, name, bio} = profile;
  const {isSubscribed, isBlocked} = profile;
  const onMentionClick = () => {
    navigate({to: "/", search: {mention: entity}});
  };

  return wrap(
    <>
      <ProfileHeader entity={entity} name={name} bio={bio}>
        <ProfileButtons>
          {isSubscribed ? (
            <Button onClick={onUnfollowClick}>Unfollow</Button>
          ) : (
            <Button variant="primary" onClick={onFollowClick}>
              Follow
            </Button>
          )}
          <Button onClick={onMentionClick}>Mention</Button>
          {isBlocked ? (
            <Button onClick={onUnblockClick}>Unblock</Button>
          ) : (
            <Button onClick={onBlockClick}>Block</Button>
          )}
        </ProfileButtons>
      </ProfileHeader>
      <Suspense fallback={<LoadingPosts />}>
        <Posts getItems={getPostVersions} renderItem={renderPost}>
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
