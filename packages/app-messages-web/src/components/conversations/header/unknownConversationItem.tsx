import {Column, Row, Text, tw} from "@baqhub/ui/core/style.js";
import {FC} from "react";
import {MessageRecordKey} from "../../../baq/messageRecord.js";
import {useUnknownConversationItemState} from "../../../state/unknownConversationItemState.js";

//
// Props.
//

interface UnknownConversationItemProps {
  messageKey: MessageRecordKey;
}

//
// Style.
//

const Layout = tw(Column)``;

const Header = tw(Row)`
  gap-2
`;

const Recipient = tw(Text)`
  grow
  font-bold
  truncate
`;

const SecondaryText = tw(Text)`
  text-neutral-500
`;

const Date = tw(SecondaryText)`
  shrink-0
`;

const LastMessage = tw(SecondaryText)`
  truncate
`;

//
// Component.
//

export const UnknownConversationItem: FC<
  UnknownConversationItemProps
> = props => {
  const {messageKey} = props;
  const state = useUnknownConversationItemState(messageKey);
  const {recipient, lastMessage} = state;

  return (
    <Layout>
      <Header>
        <Recipient>{recipient}</Recipient>
        <Date>6:14PM</Date>
      </Header>
      <LastMessage>{lastMessage}</LastMessage>
    </Layout>
  );
};
