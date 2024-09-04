import {IconButton} from "@baqhub/ui/core/iconButton.js";
import {Column, Grid, Row, tw} from "@baqhub/ui/core/style.js";
import {OkCancelDialog} from "@baqhub/ui/layers/dialog/okCancelDialog.js";
import {DropdownItem} from "@baqhub/ui/layers/dropdown/dropdownItem.js";
import {useDropdown} from "@baqhub/ui/layers/dropdown/useDropdown.js";
import {EllipsisHorizontalIcon} from "@heroicons/react/20/solid";
import {FC, useRef, useState} from "react";
import {MessageRecordKey} from "../../../baq/messageRecord.js";
import {useMessageState} from "../../../state/messageState.js";
import {MessageContent} from "./messageContent.js";

//
// Props.
//

interface ConversationMessageProps {
  messageKey: MessageRecordKey;
}

//
// Style.
//

const LayoutBase = tw(Row)`
  group

  px-3
  py-0.5
  overflow-visible
  gap-1
  items-center
`;

const SelfLayout = tw(LayoutBase)`
  peer/self
  adjacent-peer/remote:pt-3
  flex-row-reverse
`;

const RemoteLayout = tw(LayoutBase)`
  peer/remote
  adjacent-peer/self:pt-3
`;

const MessageBase = tw(Column)`
  rounded-xl
`;

const SelfMessage = tw(MessageBase)`
  peer/self
  bg-amber-300
`;

const RemoteMessage = tw(MessageBase)`
  peer/remote
  bg-white
`;

const ButtonLayout = tw(Grid)`
  invisible
  group-hover:visible
  aria-expanded:visible
`;

const Spacer = tw.div`
  grow
`;

//
// Component.
//

export const ConversationMessage: FC<ConversationMessageProps> = props => {
  const {messageKey} = props;
  const state = useMessageState(messageKey);
  const {isSelfMessage, content, onDeleteClick} = state;
  const Layout = isSelfMessage ? SelfLayout : RemoteLayout;
  const Content = isSelfMessage ? SelfMessage : RemoteMessage;

  const dropdown = useDropdown();
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  //
  // Dropdown.
  //

  const buttonRef = useRef<HTMLDivElement>(null);

  const onCopyClick = () => {
    // TODO.
  };

  const onDeleteItemClick = () => {
    setIsDeleteConfirmOpen(true);
  };

  //
  // Delete confirmation.
  //

  const onDeleteConfirmRequestClose = () => {
    setIsDeleteConfirmOpen(false);
  };

  const onDeleteConfirmClick = () => {
    onDeleteConfirmRequestClose();
    onDeleteClick();
  };

  return (
    <Layout>
      <Content>
        <MessageContent content={content} />
      </Content>
      <ButtonLayout ref={buttonRef} aria-expanded={dropdown.isOpen}>
        <IconButton
          ref={dropdown.setReference}
          variant="circle"
          onClick={dropdown.open}
          isPressed={dropdown.isOpen}
        >
          <EllipsisHorizontalIcon />
        </IconButton>
        {dropdown.render(() => (
          <>
            <DropdownItem onClick={onCopyClick}>Reply</DropdownItem>
            <DropdownItem onClick={onCopyClick}>Copy</DropdownItem>
            {isSelfMessage && (
              <DropdownItem onClick={onDeleteItemClick}>Delete...</DropdownItem>
            )}
          </>
        ))}
        {isDeleteConfirmOpen && (
          <OkCancelDialog
            title="Delete message"
            okButton="Delete"
            onCancelClick={onDeleteConfirmRequestClose}
            onOkClick={onDeleteConfirmClick}
          >
            Would you like to delete this message?
            <br />
            This action cannot be undone.
          </OkCancelDialog>
        )}
      </ButtonLayout>
      <Spacer />
    </Layout>
  );
};
