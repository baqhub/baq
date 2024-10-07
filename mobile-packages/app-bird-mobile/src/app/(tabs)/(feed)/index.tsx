import {PostRecordKey} from "@baqhub/app-bird-shared/build/src/baq/postRecord";
import {useFeedPageState} from "@baqhub/app-bird-shared/build/src/state/feedPageState";
import {Stack, router} from "expo-router";
import {FC} from "react";
import {MagnifyingGlassIcon, UsersIcon} from "react-native-heroicons/outline";
import {Screen} from "../../../components/core/screen";
import {ToolbarButton} from "../../../components/core/toolbarButton";
import {PostByKey} from "../../../components/post/postByKey";
import {EmptyPosts} from "../../../components/posts/emptyPosts";
import {Loading} from "../../../components/posts/loading";
import {Posts} from "../../../components/posts/posts";

//
// Component.
//

const FeedTab: FC = () => {
  const state = useFeedPageState();
  const {isLoading, getPostKeys} = state;
  const {isLoadingMore, loadMore} = state;

  return (
    <Screen>
      <Stack.Screen
        options={{
          title: "Bird Feed",
          headerRight: () => (
            <ToolbarButton onPress={() => router.push("/searchModal")}>
              <MagnifyingGlassIcon />
            </ToolbarButton>
          ),
        }}
      />
      <Posts
        isLoading={isLoading}
        getItems={getPostKeys}
        renderItem={renderPost}
        renderLoading={renderLoading}
        renderEmpty={renderEmpty}
        loadMore={loadMore}
        isLoadingMore={isLoadingMore}
      />
    </Screen>
  );
};

function renderPost(key: PostRecordKey) {
  return <PostByKey key={key} postKey={key} routePrefix="/(feed)" />;
}

function renderLoading() {
  return <Loading />;
}

function renderEmpty() {
  return (
    <EmptyPosts icon={<UsersIcon />}>Follow people to see more!</EmptyPosts>
  );
}

export default FeedTab;
