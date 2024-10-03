import {Handler} from "@baqhub/sdk";
import {DataProvider} from "@baqhub/sdk-react";
import {InfiniteList} from "@baqhub/ui/core/infiniteList.js";
import {tw} from "@baqhub/ui/core/style.js";
import {FC} from "react";
import {MessageRecordKey} from "../../baq/messageRecord.js";
import {ConversationMessage} from "./message/message.js";

//
// Props.
//

interface ConversationMessagesProps {
  getMessageKeys: DataProvider<ReadonlyArray<MessageRecordKey>>;
  isLoadingMore: boolean;
  loadMore: Handler | undefined;
}

//
// Style.
//

const Layout = tw(InfiniteList)`
  py-3
  justify-end
`;

//
// Component.
//

export const ConversationMessages: FC<ConversationMessagesProps> = props => {
  const {getMessageKeys, isLoadingMore, loadMore} = props;

  const itemsRender = getMessageKeys()
    .toReversed()
    .map(key => <ConversationMessage key={key} messageKey={key} />);

  return (
    <Layout top={200} loadMore={loadMore}>
      {itemsRender}
    </Layout>
  );
};
