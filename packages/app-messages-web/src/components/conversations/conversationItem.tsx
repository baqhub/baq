import {FC} from "react";
import {MessageRecordKey} from "../../baq/messageRecord.js";
import {useConversationItemState} from "../../state/conversationItemState.js";
import {ConversationSelectHandler} from "../../state/homeState.js";
import {ConversationItemBase} from "./conversationItemBase.js";

//
// Props.
//

interface ConversationItemProps {
  messageKey: MessageRecordKey;
  isSelected: boolean;
  onConversationSelect: ConversationSelectHandler;
}

//
// Component.
//

export const ConversationItem: FC<ConversationItemProps> = props => {
  const {messageKey, isSelected, onConversationSelect} = props;
  const state = useConversationItemState(messageKey, onConversationSelect);
  const {recipient, lastMessage} = state;
  const {onClick, onDeleteClick} = state;

  return (
    <ConversationItemBase
      isSelected={isSelected}
      recipient={recipient}
      lastMessage={lastMessage}
      onClick={onClick}
      onDeleteClick={onDeleteClick}
    />
  );
};
