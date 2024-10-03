import {Handler, HandlerOf} from "@baqhub/sdk";
import {DataProvider} from "@baqhub/sdk-react";
import {InfiniteList} from "@baqhub/ui/core/infiniteList.js";
import {Column, tw} from "@baqhub/ui/core/style.js";
import {FC, RefObject, useEffect, useRef} from "react";
import {ConversationRecordKey} from "../../baq/conversationRecord.js";
import {MessageRecordKey} from "../../baq/messageRecord.js";
import {ConversationMessage} from "./message/message.js";

//
// Props.
//

interface ConversationMessagesProps {
  scrollRoot: RefObject<Element>;
  conversationKey: ConversationRecordKey;
  getMessageKeys: DataProvider<ReadonlyArray<MessageRecordKey>>;
  isLoadingMore: boolean;
  loadMore: Handler | undefined;
  onSizeIncrease: HandlerOf<number>;
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
  const {
    scrollRoot,
    conversationKey,
    getMessageKeys,
    isLoadingMore,
    loadMore,
    onSizeIncrease,
  } = props;

  //
  // Size changes.
  //

  const layoutRef = useRef<HTMLDivElement>(null);
  const lastHeightRef = useRef(0);

  useEffect(() => {
    lastHeightRef.current = 0;
  }, [conversationKey]);

  useEffect(() => {
    const currentLayout = layoutRef.current;
    if (!currentLayout) {
      return;
    }

    const observer = new ResizeObserver(entries => {
      entries.forEach(entry => {
        const newHeight = entry.borderBoxSize[0]!.blockSize;

        if (newHeight > lastHeightRef.current) {
          onSizeIncrease(newHeight - lastHeightRef.current);
        }

        lastHeightRef.current = newHeight;
      });
    });

    observer.observe(currentLayout);
    return () => {
      observer.disconnect();
    };
  }, [onSizeIncrease]);

  //
  // Render.
  //

  const itemsRender = getMessageKeys()
    .toReversed()
    .map(key => <ConversationMessage key={key} messageKey={key} />);

  return (
    <Layout ref={layoutRef}>
      <InfiniteList root={scrollRoot} top={200} loadMore={loadMore}>
        {itemsRender}
      </InfiniteList>
    </Layout>
  );
};
