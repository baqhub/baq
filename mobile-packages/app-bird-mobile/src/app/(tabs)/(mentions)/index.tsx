import {PostRecordKey} from "@baqhub/app-bird-shared/build/src/baq/postRecord";
import {useMentionsPageState} from "@baqhub/app-bird-shared/build/src/state/mentionsPageState";
import {Stack} from "expo-router";
import {FC} from "react";
import {UsersIcon} from "react-native-heroicons/outline";
import {Screen} from "../../../components/core/screen";
import {PostByKey} from "../../../components/post/postByKey";
import {EmptyPosts} from "../../../components/posts/emptyPosts";
import {LoadingPosts} from "../../../components/posts/loadingPosts";
import {Posts} from "../../../components/posts/posts";

//
// Component.
//

const MentionsTab: FC = () => {
  const {isLoading, getPostKeys} = useMentionsPageState();
  return (
    <Screen>
      <Stack.Screen options={{title: "Mentions"}} />
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
  return <PostByKey key={key} postKey={key} routePrefix="/(mentions)" />;
}

function renderLoading() {
  return <LoadingPosts />;
}

function renderEmpty() {
  return (
    <EmptyPosts icon={<UsersIcon />}>
      You haven't been mentioned yet!
    </EmptyPosts>
  );
}

export default MentionsTab;
