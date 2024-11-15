import {
  PostRecordKey,
  PostVersionHash,
} from "@baqhub/app-bird-shared/build/src/baq/postRecord";
import {usePostDetailState} from "@baqhub/app-bird-shared/build/src/state/postDetailState";
import {AbsoluteDateFormatter} from "@baqhub/ui/build/src/date/absoluteDateFormatter";
import {Link, Stack} from "expo-router";
import {FC, useCallback} from "react";
import {Pressable, StyleSheet} from "react-native";
import tiwi from "tiwi";
import {Avatar} from "../../components/core/avatar";
import {Screen} from "../../components/core/screen";
import {LoadingSecondary} from "../../components/posts/loadingSecondary";
import {Posts} from "../../components/posts/posts";
import {Column, Row, Text} from "../../helpers/style";
import {PostByVersion} from "../post/postByVersion";
import {PostText} from "../post/postText";

//
// Props.
//

interface PostScreenProps {
  routePrefix: string;
  postKey: PostRecordKey;
}

//
// Style.
//

const Post = tiwi(Column)`
`;

const Content = tiwi(Column)`
  p-5
  gap-5
`;

const AuthorButton = tiwi(Pressable)`
  flex-row
  items-center
  gap-3
  active:opacity-70
`;

const AuthorAvatar = tiwi(Column)`
`;

const AuthorIdentity = tiwi(Column)`
  gap-0.5
`;

const AuthorName = tiwi(Text)`
  font-semibold
  text-base
`;

const AuthorEntity = tiwi(Text)`
  text-neutral-700
  dark:text-neutral-200
`;

const Body = tiwi(Text)`
  text-lg
  leading-7
`;

const Info = tiwi(Row)`
  p-5
  border-neutral-200
  dark:border-neutral-800
`;

const FullDate = tiwi(Text)`
  text-base
  text-neutral-400
  dark:text-neutral-600
`;

//
// Component.
//

export const PostScreen: FC<PostScreenProps> = props => {
  const {routePrefix, postKey} = props;
  const state = usePostDetailState(decodeURIComponent(postKey));
  const {authorEntity, authorName, text, textMentions, date} = state;
  const {isLoading, getReplyVersions, wrap} = state;

  const renderPost = useCallback(() => {
    return (
      <Post>
        <Content>
          <Link
            href={{
              pathname: `${routePrefix}/profile/[entity]` as any,
              params: {entity: authorEntity},
            }}
            asChild
          >
            <AuthorButton>
              <AuthorAvatar>
                <Avatar entity={authorEntity} size="medium" />
              </AuthorAvatar>
              <AuthorIdentity>
                <AuthorName>{authorName}</AuthorName>
                <AuthorEntity>{authorEntity}</AuthorEntity>
              </AuthorIdentity>
            </AuthorButton>
          </Link>
          <Body>
            <PostText
              routePrefix={routePrefix}
              text={text}
              textMentions={textMentions}
            />
          </Body>
        </Content>
        <Info
          style={{
            borderTopWidth: StyleSheet.hairlineWidth,
            borderBottomWidth: StyleSheet.hairlineWidth,
          }}
        >
          <FullDate>
            <AbsoluteDateFormatter value={date} />
          </FullDate>
        </Info>
      </Post>
    );
  }, [authorEntity, authorName, text, textMentions, date]);

  const renderReply = useCallback(
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

  return wrap(
    <Screen>
      <Stack.Screen options={{title: "Post"}} />
      <Posts
        isLoading={isLoading}
        getItems={getReplyVersions}
        isLoadingMore={false}
        loadMore={undefined}
        renderItem={renderReply}
        renderHeader={renderPost}
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
  return null;
}
