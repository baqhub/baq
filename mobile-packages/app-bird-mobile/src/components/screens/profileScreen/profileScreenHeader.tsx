import {StyleSheet} from "nativewind";
import {FC, PropsWithChildren} from "react";
import {Column, Row, Text, tw} from "../../../helpers/style";
import {Avatar} from "../../core/avatar";

//
// Props.
//

interface ProfileScreenHeaderProps extends PropsWithChildren {
  entity: string;
  name: string | undefined;
  bio: string | undefined;
  isAvatarVisible: boolean;
}

//
// Style.
//

const Profile = tw(Column)`
  p-5
  pt-[11px]
  gap-5

  border-neutral-200
  dark:border-neutral-800
`;

const ProfileTop = tw(Row)`
  items-center
`;

const ProfileTopLeft = tw(Column)`
  flex-1
  gap-1
`;

const ProfileName = tw(Text)`
  text-2xl
  font-semibold
`;

const ProfileEntity = tw(Text)`
  text-base
`;

const ProfileBio = tw(Text)`
  text-base
  leading-6
`;

//
// Component.
//

export const ProfileScreenHeader: FC<ProfileScreenHeaderProps> = props => {
  const {entity, name, bio, isAvatarVisible, children} = props;

  return (
    <Profile style={{borderBottomWidth: StyleSheet.hairlineWidth}}>
      <ProfileTop>
        <ProfileTopLeft>
          <ProfileName numberOfLines={1}>{name}</ProfileName>
          <ProfileEntity numberOfLines={1}>{entity}</ProfileEntity>
        </ProfileTopLeft>
        <Avatar entity={isAvatarVisible ? entity : undefined} size="large" />
      </ProfileTop>
      {bio && <ProfileBio>{bio}</ProfileBio>}
      {children}
      {/* {areButtonsVisible && (
        <ProfileButtons>
          <ProfileButton>
            {isSubscribed ? (
              <Button onPress={onUnfollowClick}>Unfollow</Button>
            ) : (
              <Button variant="primary" onPress={onFollowClick}>
                Follow
              </Button>
            )}
          </ProfileButton>
          <ProfileButton>
            <Button onPress={onMentionClick}>Mention</Button>
          </ProfileButton>
          <ProfileButton>
            {isBlocked ? (
              <Button onPress={onUnblockClick}>Unblock</Button>
            ) : (
              <Button onPress={onBlockButtonPress}>Block</Button>
            )}
          </ProfileButton>
        </ProfileButtons>
      )} */}
    </Profile>
  );
};
