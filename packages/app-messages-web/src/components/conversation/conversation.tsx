import {Grid, Row, tw} from "@baqhub/ui/core/style.js";
import {FC, Suspense, useDeferredValue} from "react";
import {ConversationRecordKey} from "../../baq/conversationRecord.js";
import {useNonEmptyConversationState} from "../../state/conversationState.js";
import {ConversationEmpty} from "./conversationEmpty.js";
import {ConversationHeader} from "./conversationHeader.js";
import {ConversationLoading} from "./conversationLoading.js";
import {ConversationMessages} from "./conversationMessages.js";
import {MessageComposer} from "./messageComposer/messageComposer.js";

//
// Props.
//

interface ConversationProps {
  selectedKey: ConversationRecordKey | undefined;
}

//
// Style.
//

const Layout = tw(Row)`
  relative
  min-h-0
  overflow-auto

  justify-center
  bg-neutral-200
`;

const ConversationLayout = tw(Grid)`
  grow
  max-w-lg
  min-h-full
  h-max

  grid-rows-[auto_1fr_auto]
  grid-flow-row
  px-6
`;

//
// Component.
//

export const Conversation: FC<ConversationProps> = ({selectedKey}) => {
  return (
    <Layout>
      {selectedKey ? (
        <NonEmptyConversation conversationKey={selectedKey} />
      ) : (
        <ConversationEmpty />
      )}
    </Layout>
  );
};

interface NonEmptyConversationProps {
  conversationKey: ConversationRecordKey;
}

const NonEmptyConversation: FC<NonEmptyConversationProps> = props => {
  const {conversationKey} = props;
  const state = useNonEmptyConversationState(conversationKey);

  const {recipient, getMessageKeys} = state;
  const deferredGetMessageKeys = useDeferredValue(getMessageKeys);

  return (
    <Suspense fallback={<ConversationLoading />}>
      <ConversationLayout>
        <ConversationHeader recipient={recipient} />
        <ConversationMessages getMessageKeys={deferredGetMessageKeys} />
        <MessageComposer conversationKey={conversationKey} />
      </ConversationLayout>
    </Suspense>
  );
};
