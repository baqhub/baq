import {PostVersionHash} from "@baqhub/app-bird-shared/build/src/baq/postRecord";
import {useProfilePageState} from "@baqhub/app-bird-shared/build/src/state/profilePageState";
import {router} from "expo-router";
import {FC, useCallback} from "react";
import {StyleSheet} from "react-native";
import {FaceFrownIcon, PencilSquareIcon} from "react-native-heroicons/outline";
import {Avatar} from "../../components/core/avatar";
import {Button} from "../../components/core/button";
import {Screen} from "../../components/core/screen";
import {EmptyPosts} from "../../components/posts/emptyPosts";
import {LoadingSecondary} from "../../components/posts/loadingSecondary";
import {Posts} from "../../components/posts/posts";
import {Column, Row, Text, tw} from "../../helpers/style";
import {PostByVersion} from "../post/postByVersion";

//
// Props.
//

interface ProfileScreenProps {
  routePrefix: string;
  entity: string;
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

const ProfileButtons = tw(Row)`
  gap-2
`;

const ProfileButton = tw(Column)`
  flex-1
`;

//
// Component.
//

export const ProfileScreen: FC<ProfileScreenProps> = props => {
  const {routePrefix, entity} = props;
  const state = useProfilePageState(decodeURIComponent(entity));
  const {getProfile, getFull} = state;
  const {isFullLoading, arePostsLoading} = state;
  const {onFollowClick, onUnfollowClick} = state;
  const {onBlockClick, onUnblockClick} = state;

  const isLoading = isFullLoading || arePostsLoading;
  const profile = getProfile();

  const onMentionClick = useCallback(() => {
    router.push({
      pathname: "/postComposerModal",
      params: {mention: entity},
    });
  }, [entity]);

  const renderProfile = useCallback(() => {
    if (!profile) {
      return null;
    }

    const {isProxy, name, entity, bio, isOwnProfile} = profile;
    const areButtonsVisible = !isOwnProfile && !isLoading;
    const isSubscribed = !isFullLoading && Boolean(getFull()?.isSubscribed);
    const isBlocked = !isFullLoading && Boolean(getFull()?.isBlocked);
    const showAvatar = !isProxy || !isFullLoading;

    return (
      <Profile style={{borderBottomWidth: StyleSheet.hairlineWidth}}>
        <ProfileTop>
          <ProfileTopLeft>
            <ProfileName numberOfLines={1}>{name}</ProfileName>
            <ProfileEntity numberOfLines={1}>{entity}</ProfileEntity>
          </ProfileTopLeft>
          <Avatar entity={showAvatar ? entity : undefined} size="large" />
        </ProfileTop>
        {bio && <ProfileBio>{bio}</ProfileBio>}
        {areButtonsVisible && (
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
                <Button onPress={onBlockClick}>Block</Button>
              )}
            </ProfileButton>
          </ProfileButtons>
        )}
      </Profile>
    );
  }, [
    getFull,
    isFullLoading,
    isLoading,
    onFollowClick,
    onUnfollowClick,
    onUnblockClick,
    onBlockClick,
    onMentionClick,
    profile,
  ]);

  const renderPost = useCallback(
    (version: PostVersionHash) => {
      return (
        <PostByVersion
          key={version}
          postVersion={version}
          routePrefix={routePrefix}
        />
      );
    },
    [routePrefix]
  );

  const renderEmpty = useCallback(() => {
    if (!profile) {
      return null;
    }

    if (profile.isOwnProfile) {
      return (
        <EmptyPosts icon={<PencilSquareIcon />}>
          You haven't posted anything!
        </EmptyPosts>
      );
    }

    return (
      <EmptyPosts icon={<FaceFrownIcon />}>
        This user hasn't posted anything!
      </EmptyPosts>
    );
  }, [profile]);

  if (!profile) {
    return null;
  }

  const {getPostVersions, wrap} = state;
  return wrap(
    <Screen>
      <Posts
        isLoading={isLoading}
        getItems={getPostVersions}
        renderItem={renderPost}
        renderHeader={renderProfile}
        renderLoading={renderLoading}
        renderEmpty={renderEmpty}
      />
    </Screen>
  );
};

function renderLoading() {
  return <LoadingSecondary />;
}
