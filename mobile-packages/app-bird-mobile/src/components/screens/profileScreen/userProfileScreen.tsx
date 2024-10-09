import {PostRecordKey} from "@baqhub/app-bird-shared/build/src/baq/postRecord";
import {useUserProfilePageState} from "@baqhub/app-bird-shared/build/src/state/profilePage/userProfilePageState";
import {FC, useCallback} from "react";
import {PencilSquareIcon} from "react-native-heroicons/outline";
import {Screen} from "../../core/screen";
import {PostByKey} from "../../post/postByKey";
import {EmptyPosts} from "../../posts/emptyPosts";
import {LoadingSecondary} from "../../posts/loadingSecondary";
import {Posts} from "../../posts/posts";
import {ProfileScreenHeader} from "./profileScreenHeader";

//
// Props.
//

interface UserProfileScreenProps {
  routePrefix: string;
}

//
// Component.
//

export const UserProfileScreen: FC<UserProfileScreenProps> = props => {
  const {routePrefix} = props;
  const state = useUserProfilePageState();
  const {get, arePostsLoading, getPostKeys} = state;
  const {isLoadingMore, loadMore} = state;
  const profile = get();

  const renderProfile = useCallback(() => {
    if (!profile) {
      return null;
    }

    const {entity, name, bio} = profile;
    return (
      <ProfileScreenHeader
        entity={entity}
        name={name}
        bio={bio}
        isAvatarVisible
      />
    );
  }, [profile]);

  const renderPost = useCallback(
    (key: PostRecordKey) => {
      return <PostByKey key={key} postKey={key} routePrefix={routePrefix} />;
    },
    [routePrefix]
  );

  if (!profile) {
    return null;
  }

  return (
    <Screen>
      <Posts
        isLoading={arePostsLoading}
        getItems={getPostKeys}
        isLoadingMore={isLoadingMore}
        loadMore={loadMore}
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
    <EmptyPosts icon={<PencilSquareIcon />}>
      You haven't posted anything!
    </EmptyPosts>
  );
}
