import {Column, Grid, tw} from "@baqhub/ui/core/style.js";
import {FC, Suspense, useEffect} from "react";
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

const Layout = tw(Grid)`
  grid-rows-[auto_1fr]
  grid-flow-row
  gap-3
`;

const HeaderLayout = tw(Grid)`
  row-start-1
  col-start-1
`;

const ItemsLayout = tw(Column)`
  p-5
  pt-2
  min-h-0
  overflow-auto
`;

const InfoLayout = tw(Grid)`
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
  const {draftConversationKeys, getItemKeys} = useConversationsState();

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
  onConversationSelect: ConversationSelectHandler;
}

const ConversationsContent: FC<ConversationsContentProps> = props => {
  const {selectedKey, draftConversationKeys, getItemKeys} = props;
  const {onConversationSelect} = props;
  const itemKeys = getItemKeys();
  const totalCount = draftConversationKeys.length + itemKeys.length;

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
    <ItemsLayout>
      {draftConversationKeys.map(renderDraftItem)}
      {itemKeys.map(renderItem)}
    </ItemsLayout>
  );
};
