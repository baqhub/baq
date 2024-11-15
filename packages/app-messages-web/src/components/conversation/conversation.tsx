import {Handler} from "@baqhub/sdk";
import {DataProvider} from "@baqhub/sdk-react";
import {Grid, Row} from "@baqhub/ui/core/style.js";
import {FC, Suspense, useCallback, useDeferredValue, useRef} from "react";
import tiwi from "tiwi";
import {ConversationRecordKey} from "../../baq/conversationRecord.js";
import {MessageRecordKey} from "../../baq/messageRecord.js";
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

const Layout = tiwi(Row)`
  relative
  min-h-0
  overflow-auto
  overflow-anchor-none

  justify-center
  bg-neutral-200
`;

const ConversationLayout = tiwi(Grid)`
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
  if (!selectedKey) {
    return (
      <Layout>
        <ConversationEmpty />
      </Layout>
    );
  }

  return <NonEmptyConversation conversationKey={selectedKey} />;
};

//
// Non-empty conversation.
//

interface NonEmptyConversationProps {
  conversationKey: ConversationRecordKey;
}

const NonEmptyConversation: FC<NonEmptyConversationProps> = props => {
  const {conversationKey} = props;
  const state = useNonEmptyConversationState(conversationKey);
  const {recipient, getMessageKeys, isLoadingMore, loadMore} = state;
  const deferredGetMessageKeys = useDeferredValue(getMessageKeys);
  const deferredIsLoadingMore = useDeferredValue(isLoadingMore);
  const deferredLoadMore = useDeferredValue(loadMore);

  return (
    <Suspense fallback={<Loading />}>
      <NonEmptyConversationContent
        conversationKey={conversationKey}
        recipient={recipient}
        getMessageKeys={deferredGetMessageKeys}
        isLoadingMore={deferredIsLoadingMore}
        loadMore={deferredLoadMore}
      />
    </Suspense>
  );
};

const Loading: FC = () => {
  return (
    <Layout>
      <ConversationLoading />
    </Layout>
  );
};

//
// Non-empty conversation content.
//

interface NonEmptyConversationContentProps {
  conversationKey: ConversationRecordKey;
  recipient: string;
  getMessageKeys: DataProvider<ReadonlyArray<MessageRecordKey>>;
  isLoadingMore: boolean;
  loadMore: Handler | undefined;
}

const NonEmptyConversationContent: FC<
  NonEmptyConversationContentProps
> = props => {
  const {conversationKey, recipient} = props;
  const {getMessageKeys, isLoadingMore, loadMore} = props;
  const deferredConversationKey = useDeferredValue(conversationKey);

  //
  // Scroll.
  //

  const layoutRef = useRef<HTMLDivElement>(null);

  const onComponentSizeIncrease = useCallback((delta: number) => {
    const currentLayout = layoutRef.current;
    if (!currentLayout) {
      return;
    }

    const {scrollTop} = currentLayout;
    const newScrollTop = scrollTop + delta;
    currentLayout.scrollTo({top: newScrollTop});
  }, []);

  return (
    <Layout ref={layoutRef}>
      <ConversationLayout>
        <ConversationHeader recipient={recipient} />
        <ConversationMessages
          scrollRoot={layoutRef}
          conversationKey={deferredConversationKey}
          getMessageKeys={getMessageKeys}
          isLoadingMore={isLoadingMore}
          loadMore={loadMore}
          onSizeIncrease={onComponentSizeIncrease}
        />
        <MessageComposer
          conversationKey={conversationKey}
          onSizeIncrease={onComponentSizeIncrease}
        />
      </ConversationLayout>
    </Layout>
  );
};
