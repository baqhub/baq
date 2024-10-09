import {PostRecordKey} from "@baqhub/app-bird-shared/build/src/baq/postRecord";
import {useMentionsPageState} from "@baqhub/app-bird-shared/build/src/state/mentionsPageState";
import {Stack} from "expo-router";
import {FC} from "react";
import {UsersIcon} from "react-native-heroicons/outline";
import {Screen} from "../../../components/core/screen";
import {PostByKey} from "../../../components/post/postByKey";
import {EmptyPosts} from "../../../components/posts/emptyPosts";
import {Loading} from "../../../components/posts/loading";
import {Posts} from "../../../components/posts/posts";

//
// Component.
//

const MentionsTab: FC = () => {
  const state = useMentionsPageState();
  const {isLoading, getPostKeys} = state;
  const {isLoadingMore, loadMore} = state;

  return (
    <Screen>
      <Stack.Screen options={{title: "Mentions"}} />
      <Posts
        isLoading={isLoading}
        getItems={getPostKeys}
        isLoadingMore={isLoadingMore}
        loadMore={loadMore}
        renderItem={renderPost}
        renderLoading={renderLoading}
        renderEmpty={renderEmpty}
      />
    </Screen>
  );
};

function renderPost(key: PostRecordKey) {
  return <PostByKey key={key} postKey={key} routePrefix="/(mentions)" />;
}

function renderLoading() {
  return <Loading />;
}

function renderEmpty() {
  return (
    <EmptyPosts icon={<UsersIcon />}>
      You haven't been mentioned yet!
    </EmptyPosts>
  );
}

export default MentionsTab;
