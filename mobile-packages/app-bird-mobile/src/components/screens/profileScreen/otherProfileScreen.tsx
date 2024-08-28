import {PostVersionHash} from "@baqhub/app-bird-shared/build/src/baq/postRecord";
import {useOtherProfilePageState} from "@baqhub/app-bird-shared/build/src/state/profilePage/otherProfilePageState";
import {router} from "expo-router";
import {FC, useCallback} from "react";
import {Alert} from "react-native";
import {FaceFrownIcon} from "react-native-heroicons/outline";
import {Column, Row, tw} from "../../../helpers/style";
import {Button} from "../../core/button";
import {Screen} from "../../core/screen";
import {PostByVersion} from "../../post/postByVersion";
import {EmptyPosts} from "../../posts/emptyPosts";
import {LoadingSecondary} from "../../posts/loadingSecondary";
import {Posts} from "../../posts/posts";
import {ProfileScreenHeader} from "./profileScreenHeader";

//
// Props.
//

interface OtherProfileScreenProps {
  routePrefix: string;
  otherEntity: string;
}

//
// Style.
//

const ProfileButtons = tw(Row)`
  gap-2
`;

const ProfileButton = tw(Column)`
  flex-1
`;

//
// Component.
//

export const OtherProfileScreen: FC<OtherProfileScreenProps> = props => {
  const {routePrefix, otherEntity} = props;
  const state = useOtherProfilePageState(decodeURIComponent(otherEntity));
  const {get, getFull} = state;
  const {isFullLoading, arePostsLoading} = state;
  const {onFollowClick, onUnfollowClick} = state;
  const {onBlockClick, onUnblockClick} = state;

  const isLoading = isFullLoading || arePostsLoading;
  const profile = get();

  const renderProfile = useCallback(() => {
    if (!profile) {
      return null;
    }

    const {isProxy, entity, name, bio} = profile;
    const isSubscribed = !isFullLoading && Boolean(getFull()?.isSubscribed);
    const isBlocked = !isFullLoading && Boolean(getFull()?.isBlocked);
    const isAvatarVisible = !isProxy || !isFullLoading;

    const onMentionClick = () => {
      router.push({
        pathname: "/postComposerModal",
        params: {mention: entity},
      });
    };

    const onBlockButtonPress = () => {
      Alert.alert(
        "Block User",
        "Block this user across all BAQ apps? They will be unable to share content with you.",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Block",
            style: "destructive",
            onPress: onBlockClick,
          },
        ]
      );
    };

    return (
      <ProfileScreenHeader
        entity={entity}
        name={name}
        bio={bio}
        isAvatarVisible={isAvatarVisible}
      >
        {!isLoading && (
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
        )}
      </ProfileScreenHeader>
    );
  }, [
    getFull,
    isFullLoading,
    isLoading,
    onFollowClick,
    onUnfollowClick,
    onBlockClick,
    onUnblockClick,
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

function renderEmpty() {
  return (
    <EmptyPosts icon={<FaceFrownIcon />}>
      This user hasn't posted anything!
    </EmptyPosts>
  );
}
