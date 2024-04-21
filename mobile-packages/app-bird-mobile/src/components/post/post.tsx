import {RelativeDateFormatter} from "@baqhub/app-bird-shared/build/src/components/date/relativeDateFormatter";
import {usePostState} from "@baqhub/app-bird-shared/build/src/state/postState";
import {Link} from "expo-router";
import {FC} from "react";
import {Pressable, StyleSheet} from "react-native";
import {
  ArrowPathRoundedSquareIcon,
  ChatBubbleOvalLeftIcon,
  HeartIcon,
  PaperAirplaneIcon,
} from "react-native-heroicons/outline";
import {Column, Icon, Row, Text, tw} from "../../helpers/style";
import {Avatar} from "../core/avatar";
import {PostText} from "./postText";

//
// Props.
//

interface PostProps extends ReturnType<typeof usePostState> {
  routePrefix: string;
}

//
// Style.
//

const Layout = tw(Row)`
  px-5
  pt-4
  pb-3
  gap-3

  border-b-neutral-200
  dark:border-b-neutral-800
`;

const AvatarButton = tw(Pressable)`
  shrink-0
  active:opacity-70
`;

const Content = tw(Column)`
  flex-1
  gap-1
`;

const InfoRow = tw(Row)`
  gap-1
  items-baseline
`;

const AuthorNameButton = tw(Pressable)`
  shrink
  group
`;

const AuthorName = tw(Text)`
  shrink
  text-[16px]
  font-semibold
  text-neutral-800
  dark:text-neutral-100
  group-active:text-neutral-600
  group-active:dark:text-neutral-300
`;

const AuthorEntity = tw(Text)`
  shrink-[2]
  text-neutral-500
  dark:text-neutral-500
`;

const DateText = tw(Text)`
  flex-1
  shrink-0

  text-right
  text-neutral-500
  dark:text-neutral-500
`;

const BodyText = tw(Text)`
  text-neutral-800
  text-[16px]
  leading-5
`;

const MentionText = tw(Text)`
  text-amber-700
  dark:text-amber-500
`;

const Actions = tw(Row)`
  -mt-0.5
  -mx-2
`;

const ActionButton = tw(Pressable)`
  p-2

  active:bg-neutral-900/10
  active:dark:bg-white/20
  rounded-full
`;

const ActionButtonIcon = tw(Icon)`
  w-[22px]
  h-[22px]
  border-2
  text-neutral-700
  dark:text-neutral-200
`;

//
// Component.
//

export const Post: FC<PostProps> = props => {
  const {routePrefix, proxyEntity, postKey} = props;
  const {authorEntity, authorName, text, textMentions, date} = props;

  return (
    <Link
      href={{
        pathname: `${routePrefix}/post/[postKey]` as any,
        params: {proxyEntity, postKey},
      }}
      asChild
    >
      <Pressable>
        <Layout style={{borderBottomWidth: StyleSheet.hairlineWidth}}>
          <Link
            href={{
              pathname: `${routePrefix}/profile/[entity]` as any,
              params: {entity: authorEntity},
            }}
            asChild
          >
            <AvatarButton>
              <Avatar entity={authorEntity} />
            </AvatarButton>
          </Link>
          <Content>
            <InfoRow>
              <Link
                href={{
                  pathname: `${routePrefix}/profile/[entity]` as any,
                  params: {entity: authorEntity},
                }}
                asChild
              >
                <AuthorNameButton>
                  <AuthorName numberOfLines={1}>{authorName}</AuthorName>
                </AuthorNameButton>
              </Link>
              <AuthorEntity numberOfLines={1}>{authorEntity}</AuthorEntity>
              <DateText>
                <RelativeDateFormatter value={date} />
              </DateText>
            </InfoRow>
            <BodyText>
              <PostText
                text={text}
                textMentions={textMentions}
                MentionComponent={MentionText}
              />
            </BodyText>
            <Actions>
              <ActionButton>
                <ActionButtonIcon style={{transform: [{translateY: 0.5}]}}>
                  <HeartIcon />
                </ActionButtonIcon>
              </ActionButton>
              <ActionButton>
                <ActionButtonIcon>
                  <ChatBubbleOvalLeftIcon />
                </ActionButtonIcon>
              </ActionButton>
              <ActionButton>
                <ActionButtonIcon>
                  <ArrowPathRoundedSquareIcon />
                </ActionButtonIcon>
              </ActionButton>
              <ActionButton>
                <ActionButtonIcon>
                  <PaperAirplaneIcon />
                </ActionButtonIcon>
              </ActionButton>
            </Actions>
          </Content>
        </Layout>
      </Pressable>
    </Link>
  );
};
