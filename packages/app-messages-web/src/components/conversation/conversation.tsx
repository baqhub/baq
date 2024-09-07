import {DataProvider} from "@baqhub/sdk-react";
import {Grid, Row, tw} from "@baqhub/ui/core/style.js";
import throttle from "lodash/throttle.js";
import {
  FC,
  Suspense,
  useCallback,
  useDeferredValue,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
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

  const {recipient, getMessageKeys} = state;
  const deferredGetMessageKeys = useDeferredValue(getMessageKeys);

  return (
    <Suspense fallback={<Loading />}>
      <NonEmptyConversationContent
        conversationKey={conversationKey}
        recipient={recipient}
        getMessageKeys={deferredGetMessageKeys}
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
}

const NonEmptyConversationContent: FC<
  NonEmptyConversationContentProps
> = props => {
  const {conversationKey, recipient, getMessageKeys} = props;
  const deferredConversationKey = useDeferredValue(conversationKey);

  //
  // Scroll.
  //

  const layoutRef = useRef<HTMLDivElement>(null);
  const isAtEndRef = useRef(true);

  const onScroll = useMemo(
    () =>
      throttle(() => {
        const currentLayout = layoutRef.current;
        if (!currentLayout) {
          return;
        }

        const {scrollHeight, offsetHeight, scrollTop} = currentLayout;
        isAtEndRef.current = scrollHeight - offsetHeight - scrollTop < 10;
      }, 100),
    []
  );

  useLayoutEffect(() => {
    isAtEndRef.current = true;
  }, [deferredConversationKey]);

  const keys = getMessageKeys();
  const lastKey = keys[keys.length - 1];

  useLayoutEffect(() => {
    const currentLayout = layoutRef.current;
    if (!currentLayout) {
      return;
    }

    // Only scroll if we're close to the bottom.
    const currentIsAtEnd = isAtEndRef.current;
    if (!currentIsAtEnd) {
      return;
    }

    const {scrollHeight, offsetHeight} = currentLayout;
    const newScrollTop = scrollHeight - offsetHeight;
    currentLayout.scrollTo({top: newScrollTop});
  }, [lastKey]);

  const onMessageComposerSizeIncrease = useCallback((delta: number) => {
    const currentLayout = layoutRef.current;
    if (!currentLayout) {
      return;
    }

    const {scrollTop} = currentLayout;
    const newScrollTop = scrollTop + delta;
    currentLayout.scrollTo({top: newScrollTop});
  }, []);

  return (
    <Layout ref={layoutRef} onScroll={onScroll}>
      <ConversationLayout>
        <ConversationHeader recipient={recipient} />
        <ConversationMessages getMessageKeys={getMessageKeys} />
        <MessageComposer
          conversationKey={conversationKey}
          onSizeIncrease={onMessageComposerSizeIncrease}
        />
      </ConversationLayout>
    </Layout>
  );
};
