import {DataProvider} from "@baqhub/sdk-react";
import {Column, tw} from "@baqhub/ui/core/style.js";
import {FC} from "react";
import {MessageRecordKey} from "../../baq/messageRecord.js";
import {ConversationMessage} from "./message/message.js";

//
// Props.
//

interface ConversationMessagesProps {
  getMessageKeys: DataProvider<ReadonlyArray<MessageRecordKey>>;
}

//
// Style.
//

const Layout = tw(Column)`
  py-3
  justify-end
`;

//
// Component.
//

export const ConversationMessages: FC<ConversationMessagesProps> = props => {
  const {getMessageKeys} = props;

  const itemsRender = getMessageKeys().map(key => (
    <ConversationMessage key={key} messageKey={key} />
  ));

  return <Layout>{itemsRender}</Layout>;
};
