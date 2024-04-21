import {PostRecordKey} from "@baqhub/app-bird-shared/build/src/baq/postRecord";
import {useFeedPageState} from "@baqhub/app-bird-shared/build/src/state/feedPageState";
import {Stack, router} from "expo-router";
import {FC} from "react";
import {MagnifyingGlassIcon, UsersIcon} from "react-native-heroicons/outline";
import {Screen} from "../../../components/core/screen";
import {ToolbarButton} from "../../../components/core/toolbarButton";
import {PostByKey} from "../../../components/post/postByKey";
import {EmptyPosts} from "../../../components/posts/emptyPosts";
import {LoadingPosts} from "../../../components/posts/loadingPosts";
import {Posts} from "../../../components/posts/posts";

//
// Component.
//

const FeedTab: FC = () => {
  const {isLoading, getPostKeys} = useFeedPageState();

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
      />
    </Screen>
  );
};

function renderPost(key: PostRecordKey) {
  return <PostByKey key={key} postKey={key} routePrefix="/(feed)" />;
}

function renderLoading() {
  return <LoadingPosts />;
}

function renderEmpty() {
  return (
    <EmptyPosts icon={<UsersIcon />}>Follow people to see more!</EmptyPosts>
  );
}

export default FeedTab;
