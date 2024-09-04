import {Handler} from "@baqhub/sdk";
import {IconButton} from "@baqhub/ui/core/iconButton.js";
import {Row, Text, tw} from "@baqhub/ui/core/style.js";
import {PencilSquareIcon, UserIcon} from "@heroicons/react/20/solid";
import {FC} from "react";

//
// Props.
//

interface ConversationsHeaderProps {
  onComposeClick: Handler;
}

//
// Style.
//

const Layout = tw(Row)`
  px-6
  pt-6
  items-end
  gap-1
`;

const Title = tw(Text)`
  grow
  pl-2
  text-2xl
  font-semibold
`;

//
// Component.
//

export const ConversationsHeader: FC<ConversationsHeaderProps> = props => {
  const {onComposeClick} = props;
  return (
    <Layout>
      <Title>Messages</Title>
      <IconButton onClick={onComposeClick}>
        <UserIcon />
      </IconButton>
      <IconButton onClick={onComposeClick}>
        <PencilSquareIcon />
      </IconButton>
    </Layout>
  );
};
