import {
  PostRecordKey,
  PostVersionHash,
} from "@baqhub/app-bird-shared/build/src/baq/postRecord";
import {usePostDetailState} from "@baqhub/app-bird-shared/build/src/state/postDetailState";
import {AbsoluteDateFormatter} from "@baqhub/ui/build/src/date/absoluteDateFormatter";
import {Link, Stack} from "expo-router";
import {FC, useCallback} from "react";
import {Pressable, StyleSheet} from "react-native";
import {Avatar} from "../../components/core/avatar";
import {Screen} from "../../components/core/screen";
import {LoadingSecondary} from "../../components/posts/loadingSecondary";
import {Posts} from "../../components/posts/posts";
import {Column, Row, Text, tw} from "../../helpers/style";
import {PostByVersion} from "../post/postByVersion";
import {PostText} from "../post/postText";
import {PostMention} from "./postMention";

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

const Post = tw(Column)`
`;

const Content = tw(Column)`
  p-5
  gap-5
`;

const AuthorButton = tw(Pressable)`
  flex-row
  items-center
  gap-3
  active:opacity-70
`;

const AuthorAvatar = tw(Column)`
`;

const AuthorIdentity = tw(Column)`
  gap-0.5
`;

const AuthorName = tw(Text)`
  font-semibold
  text-base
`;

const AuthorEntity = tw(Text)`
  text-neutral-700
  dark:text-neutral-200
`;

const Body = tw(Text)`
  text-lg
  font-light
  leading-7
`;

const Info = tw(Row)`
  p-5
  border-neutral-200
  dark:border-neutral-800
`;

const FullDate = tw(Text)`
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
              pathname: "../profile/[entity]",
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
              text={text}
              textMentions={textMentions}
              MentionComponent={PostMention}
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
