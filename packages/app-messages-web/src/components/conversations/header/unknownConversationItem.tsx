import {Button} from "@baqhub/ui/core/button.js";
import {ButtonGroup} from "@baqhub/ui/core/buttonGroup.js";
import {Column, Row, Text} from "@baqhub/ui/core/style.js";
import {MixedDateFormatter} from "@baqhub/ui/date/mixedDateFormatter.js";
import {FC} from "react";
import tiwi from "tiwi";
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

const Layout = tiwi(Row)`
  relative
  items-center

  gap-4

  after:absolute
  after:left-0
  after:top-0
  after:right-0
  after:h-px
  after:bg-neutral-200
  first:after:hidden
`;

const Details = tiwi(Column)`
  grow
  py-3
`;

const Recipient = tiwi(Text)`
  grow
  font-bold
  truncate
`;

const SecondaryText = tiwi(Text)`
  text-neutral-500
`;

const LastMessage = tiwi(SecondaryText)`
  truncate
`;

const Date = tiwi(SecondaryText)`
  shrink-0
`;

//
// Component.
//

export const UnknownConversationItem: FC<
  UnknownConversationItemProps
> = props => {
  const {messageKey} = props;
  const state = useUnknownConversationItemState(messageKey);
  const {recipient, date, lastMessage} = state;
  const {onAcceptClick, onBlockClick} = state;

  return (
    <Layout>
      <Details>
        <Recipient>{recipient}</Recipient>
        <LastMessage>{lastMessage}</LastMessage>
      </Details>
      {date && (
        <Date>
          <MixedDateFormatter value={date} />
        </Date>
      )}
      <ButtonGroup>
        <Button variant="primary" size="large" onClick={onAcceptClick}>
          Accept
        </Button>
        <Button size="large" onClick={onBlockClick}>
          Block
        </Button>
      </ButtonGroup>
    </Layout>
  );
};
