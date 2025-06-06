import {usePostState} from "@baqhub/bird-shared/state/postState.js";
import {ButtonRow, Column, Row, TextSelect} from "@baqhub/ui/core/style.js";
import {RelativeDateFormatter} from "@baqhub/ui/date/relativeDateFormatter.js";
import {
  ArrowPathRoundedSquareIcon,
  ChatBubbleOvalLeftIcon,
  HeartIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";
import {Link} from "@tanstack/react-router";
import {FC} from "react";
import tiwi from "tiwi";
import {Avatar} from "../avatar.js";
import {PostText} from "./postText.js";

//
// Props.
//

interface PostProps extends ReturnType<typeof usePostState> {}

//
// Style.
//

const Layout = tiwi(Row)`
  mx-3
  py-4
  gap-3

  border-t
  first:border-t-0
  border-t-neutral-200
  dark:border-t-neutral-700
`;

const avatarLinkStyle = `
  mt-0.5
`;

const Content = tiwi(Column)`
  grow
  gap-1
`;

const InfoRow = tiwi(Row)``;

const userLinkStyle = `
  group

  text-base
  text-neutral-900
  dark:text-white

  select-auto
`;

const UserLinkName = tiwi.span`
  font-semibold
  group-hover:underline
  underline-offset-2
`;

const UserLinkEntity = tiwi.span`
  text-sm
  text-neutral-400
  dark:text-neutral-500
`;

const BodyText = tiwi(TextSelect)`
  text-base
  font-light
  whitespace-pre-wrap
`;

const DateText = tiwi(TextSelect)`
  grow

  text-right
  text-base
  text-neutral-400
  dark:text-neutral-500
`;

const Actions = tiwi(Row)`
  -mx-2
`;

const ActionButton = tiwi(ButtonRow)`
  [&_svg]:w-5
  [&_svg]:h-5

  p-2
  hover:bg-neutral-900/5
  active:bg-neutral-900/10
  dark:hover:bg-white/10
  dark:active:bg-white/20
  rounded-full

  text-neutral-900
  dark:text-white
`;

//
// Component.
//

export const Post: FC<PostProps> = props => {
  const {authorEntity, authorName, text, textFacets, date} = props;

  return (
    <Layout>
      <Link
        to="/profile/$entity"
        params={{entity: authorEntity}}
        className={avatarLinkStyle}
      >
        <Avatar entity={authorEntity} />
      </Link>
      <Content>
        <InfoRow>
          <Link
            to="/profile/$entity"
            params={{entity: authorEntity}}
            className={userLinkStyle}
          >
            <UserLinkName>{authorName || authorEntity}</UserLinkName>&nbsp;
            {authorName && <UserLinkEntity>{authorEntity}</UserLinkEntity>}
          </Link>
          <DateText>
            <RelativeDateFormatter value={date} />
          </DateText>
        </InfoRow>
        <BodyText>
          <PostText text={text} textFacets={textFacets} />
        </BodyText>
        <Actions>
          <ActionButton>
            <HeartIcon />
          </ActionButton>
          <ActionButton>
            <ChatBubbleOvalLeftIcon />
          </ActionButton>
          <ActionButton>
            <ArrowPathRoundedSquareIcon />
          </ActionButton>
          <ActionButton>
            <PaperAirplaneIcon />
          </ActionButton>
        </Actions>
      </Content>
    </Layout>
  );
};
