import {FC} from "react";
import {ConversationRecordKey} from "../../baq/conversationRecord.js";
import {useConversationDraftItemState} from "../../state/conversationDraftItemState.js";
import {ConversationSelectHandler} from "../../state/homeState.js";
import {ConversationItemBase} from "./conversationItemBase.js";

//
// Props.
//

interface ConversationDraftItemsProps {
  conversationKey: ConversationRecordKey;
  isSelected: boolean;
  onConversationSelect: ConversationSelectHandler;
}

//
// Component.
//

export const ConversationDraftItem: FC<ConversationDraftItemsProps> = props => {
  const {conversationKey, isSelected, onConversationSelect} = props;
  const {recipient, onClick, onDeleteClick} = useConversationDraftItemState(
    conversationKey,
    onConversationSelect
  );

  return (
    <ConversationItemBase
      isSelected={isSelected}
      recipient={recipient}
      onClick={onClick}
      onDeleteClick={onDeleteClick}
    />
  );
};
