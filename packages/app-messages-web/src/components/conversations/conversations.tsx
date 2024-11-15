import {Handler} from "@baqhub/sdk";
import {InfiniteList} from "@baqhub/ui/core/infiniteList.js";
import {Column, Grid} from "@baqhub/ui/core/style.js";
import {FC, Suspense, useEffect, useRef} from "react";
import tiwi from "tiwi";
import {ConversationRecordKey} from "../../baq/conversationRecord.js";
import {
  GetItemKeys,
  ItemKey,
  useConversationsState,
} from "../../state/conversationsState.js";
import {ConversationSelectHandler} from "../../state/homeState.js";
import {ConversationDraftItem} from "./conversationDraftItem.js";
import {ConversationItem} from "./conversationItem.js";
import {ConversationsEmpty} from "./conversationsEmpty.js";
import {ConversationsLoading} from "./conversationsLoading.js";
import {ConversationsLoadingMore} from "./conversationsLoadingMore.js";
import {Header} from "./header/header.js";

//
// Props.
//

interface ConversationsProps {
  selectedKey: ConversationRecordKey | undefined;
  onConversationSelect: ConversationSelectHandler;
}

//
// Style.
//

const Layout = tiwi(Grid)`
  grid-rows-[auto_1fr]
  grid-flow-row
  gap-3
`;

const HeaderLayout = tiwi(Grid)`
  row-start-1
  col-start-1
`;

const ScrollLayout = tiwi(Column)`
  p-5
  pt-2
  min-h-0
  overflow-auto
`;

const InfoLayout = tiwi(Grid)`
  row-start-1
  row-span-2
  col-start-1
  pointer-events-none
`;

//
// Component.
//

export const Conversations: FC<ConversationsProps> = props => {
  const {selectedKey, onConversationSelect} = props;
  const state = useConversationsState();
  const {draftConversationKeys, getItemKeys, isLoadingMore, loadMore} = state;

  const renderLoading = () => {
    return (
      <InfoLayout>
        <ConversationsLoading />
      </InfoLayout>
    );
  };

  return (
    <Layout>
      <HeaderLayout>
        <Header onConversationSelect={onConversationSelect} />
      </HeaderLayout>
      <Suspense fallback={renderLoading()}>
        <ConversationsContent
          selectedKey={selectedKey}
          draftConversationKeys={draftConversationKeys}
          getItemKeys={getItemKeys}
          isLoadingMore={isLoadingMore}
          loadMore={loadMore}
          onConversationSelect={onConversationSelect}
        />
      </Suspense>
    </Layout>
  );
};

interface ConversationsContentProps {
  selectedKey: ConversationRecordKey | undefined;
  draftConversationKeys: ReadonlyArray<ConversationRecordKey>;
  getItemKeys: GetItemKeys;
  isLoadingMore: boolean;
  loadMore: Handler | undefined;
  onConversationSelect: ConversationSelectHandler;
}

const ConversationsContent: FC<ConversationsContentProps> = props => {
  const {selectedKey, draftConversationKeys, getItemKeys} = props;
  const {isLoadingMore, loadMore, onConversationSelect} = props;
  const itemKeys = getItemKeys();
  const totalCount = draftConversationKeys.length + itemKeys.length;
  const scrollLayoutRef = useRef<HTMLDivElement>(null);

  // Select first item if needed.
  useEffect(() => {
    const firstItemKey = draftConversationKeys[0] || itemKeys[0]?.[1];
    if (selectedKey || !firstItemKey) {
      return;
    }

    onConversationSelect(firstItemKey);
  }, [selectedKey, draftConversationKeys, itemKeys, onConversationSelect]);

  if (totalCount === 0) {
    return (
      <InfoLayout>
        <ConversationsEmpty />
      </InfoLayout>
    );
  }

  const renderDraftItem = (conversationKey: ConversationRecordKey) => {
    return (
      <ConversationDraftItem
        key={conversationKey}
        conversationKey={conversationKey}
        isSelected={conversationKey === selectedKey}
        onConversationSelect={onConversationSelect}
      />
    );
  };

  const renderItem = (itemKey: ItemKey) => {
    return (
      <ConversationItem
        key={itemKey[0]}
        messageKey={itemKey[0]}
        isSelected={itemKey[1] === selectedKey}
        onConversationSelect={onConversationSelect}
      />
    );
  };

  return (
    <ScrollLayout ref={scrollLayoutRef}>
      <InfiniteList root={scrollLayoutRef} bottom={200} loadMore={loadMore}>
        {draftConversationKeys.map(renderDraftItem)}
        {itemKeys.map(renderItem)}
        {loadMore && <ConversationsLoadingMore />}
      </InfiniteList>
    </ScrollLayout>
  );
};
