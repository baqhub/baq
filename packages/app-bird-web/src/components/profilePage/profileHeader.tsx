import {FullProfileData} from "@baqhub/bird-shared/state/profilePageState.js";
import {Handler} from "@baqhub/sdk";
import {Button} from "@baqhub/ui/core/button.js";
import {Column, Grid, Row, Text, tw} from "@baqhub/ui/core/style.js";
import {useNavigate} from "@tanstack/react-router";
import {FC} from "react";
import {Avatar} from "../shared/avatar.js";

//
// Props.
//

interface ProfileHeaderProps {
  profile: FullProfileData;
  onFollowClick: Handler;
  onUnfollowClick: Handler;
  onBlockClick: Handler;
  onUnblockClick: Handler;
}

//
// Style.
//

const Profile = tw(Column)`
  py-10
  px-3

  gap-6
`;

const ProfileTop = tw(Row)`
  items-center
`;

const ProfileTopLeft = tw(Column)`
  grow
`;

const ProfileName = tw(Text)`
  text-2xl
  font-semibold
`;

const ProfileEntity = tw(Text)`
  text-md
`;

const ProfileTopAvatar = tw(Column)`
`;

const ProfileBio = tw(Text)`
  text-md
`;

const ProfileButtons = tw(Grid)`
  grid-flow-col
  auto-cols-fr
  gap-2
  py-2
`;

//
// Component.
//

export const ProfileHeader: FC<ProfileHeaderProps> = props => {
  const {profile, onFollowClick, onUnfollowClick} = props;
  const {onBlockClick, onUnblockClick} = props;
  const {entity, name, bio, isOwnProfile, isSubscribed, isBlocked} = profile;

  const navigate = useNavigate();
  const onMentionClick = () => {
    navigate({to: "/", search: {mention: entity}});
  };

  return (
    <Profile>
      <ProfileTop>
        <ProfileTopLeft>
          <ProfileName>{name || entity}</ProfileName>
          {name && <ProfileEntity>{entity}</ProfileEntity>}
        </ProfileTopLeft>
        <ProfileTopAvatar>
          <Avatar entity={entity} size="large" />
        </ProfileTopAvatar>
      </ProfileTop>
      {bio && <ProfileBio>{bio}</ProfileBio>}
      {!isOwnProfile && (
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
      )}
    </Profile>
  );
};
