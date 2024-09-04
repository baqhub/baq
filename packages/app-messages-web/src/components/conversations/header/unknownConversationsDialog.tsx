import {Handler} from "@baqhub/sdk";
import {Button} from "@baqhub/ui/core/button.js";
import {Column, Row, Text, tw} from "@baqhub/ui/core/style.js";
import {Dialog} from "@baqhub/ui/layers/dialog/dialog.js";
import {FC, Suspense} from "react";
import {GetItemKeys, ItemKey} from "../../../state/conversationsState.js";
import {UnknownConversationItem} from "./unknownConversationItem.js";

//
// Props.
//

interface UnknownConversationsDialogProps {
  getItemKeys: GetItemKeys;
  onRequestClose: Handler;
}

//
// Style.
//

const Layout = tw(Column)`
  w-[460px]
  max-h-[500px]
  min-h-0
  gap-3
`;

const Title = tw(Text)`
  text-2xl
  font-semibold
`;

const Conversations = tw(Column)`
  overflow-y-auto
`;

const Footer = tw(Row)`
  pt-3
  justify-end

  border-t
  border-neutral-200
`;

//
// Component.
//

export const UnknownConversationsDialog: FC<
  UnknownConversationsDialogProps
> = props => {
  const {getItemKeys, onRequestClose} = props;

  return (
    <Dialog onRequestClose={onRequestClose}>
      <Layout>
        <Title>Unknown senders</Title>
        <Conversations>
          <Suspense>
            <UnknownConversationsContent getItemKeys={getItemKeys} />
          </Suspense>
        </Conversations>
        <Footer>
          <Button size="large" onClick={onRequestClose}>
            Close
          </Button>
        </Footer>
      </Layout>
    </Dialog>
  );
};

interface UnknownConversationsContentProps {
  getItemKeys: GetItemKeys;
}

const UnknownConversationsContent: FC<
  UnknownConversationsContentProps
> = props => {
  const {getItemKeys} = props;
  const itemKeys = getItemKeys();

  if (itemKeys.length === 0) {
    return null;
  }

  const renderItem = (itemKey: ItemKey) => {
    return <UnknownConversationItem key={itemKey[0]} messageKey={itemKey[0]} />;
  };

  return <>{itemKeys.map(renderItem)}</>;
};
