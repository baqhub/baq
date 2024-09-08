import {Handler, noop} from "@baqhub/sdk";
import {Column, Row, Text, tw} from "@baqhub/ui/core/style.js";
import {MixedDateFormatter} from "@baqhub/ui/date/mixedDateFormatter.js";
import {OkCancelDialog} from "@baqhub/ui/layers/dialog/okCancelDialog.js";
import {DropdownItem} from "@baqhub/ui/layers/dropdown/dropdownItem.js";
import {useDropdown} from "@baqhub/ui/layers/dropdown/useDropdown.js";
import {FC, MouseEvent, useState} from "react";

//
// Props.
//

interface ConversationItemBaseProps {
  isSelected: boolean;
  recipient: string;
  date?: Date;
  lastMessage?: string;
  onClick: Handler;
  onDeleteClick: Handler;
}

//
// Style.
//

const Layout = tw(Column)`
  peer
  group
  relative

  px-3
  py-2
  gap-0.5

  rounded-xl

  aria-selected:bg-amber-500

  after:absolute
  after:left-3
  after:top-0
  after:right-3
  after:h-px
  after:bg-neutral-200

  aria-selected:after:hidden
  adjacent-peer-aria-selected:after:hidden
  first:after:hidden
`;

const Header = tw(Row)`
  gap-2
`;

const Title = tw(Text)`
  grow
  font-bold
  truncate

  group-aria-selected:text-white
`;

const SecondaryText = tw(Text)`
  text-neutral-500

  group-aria-selected:text-white
  group-aria-selected:opacity-80
`;

const Date = tw(SecondaryText)`
  shrink-0
`;

const LastMessage = tw(SecondaryText)`
  h-10
  line-clamp-2
`;

const LastMessageEmpty = tw(SecondaryText)`
  h-10
  italic
  text-neutral-400
`;

//
// Component.
//

export const ConversationItemBase: FC<ConversationItemBaseProps> = props => {
  const {isSelected, recipient, date, lastMessage} = props;
  const {onClick, onDeleteClick} = props;
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const renderLastMessage = () => {
    if (!lastMessage) {
      return <LastMessageEmpty>No content</LastMessageEmpty>;
    }

    return <LastMessage>{lastMessage.substring(0, 200)}</LastMessage>;
  };

  const onMouseDown = (e: MouseEvent) => {
    e.preventDefault();
  };

  //
  // Dropdown.
  //

  const dropdown = useDropdown();

  const onContextMenu = (e: MouseEvent) => {
    dropdown.openContextMenu(e);
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
    <Layout
      aria-selected={isSelected}
      onMouseDown={onMouseDown}
      onClick={onClick}
      onContextMenu={onContextMenu}
    >
      <Header>
        <Title>{recipient}</Title>
        {date && (
          <Date>
            <MixedDateFormatter value={date} />
          </Date>
        )}
      </Header>
      {renderLastMessage()}
      {dropdown.render(() => (
        <>
          <DropdownItem onClick={noop}>Mark as unread</DropdownItem>
          <DropdownItem onClick={onDeleteItemClick}>Delete...</DropdownItem>
        </>
      ))}
      {isDeleteConfirmOpen && (
        <OkCancelDialog
          title="Delete conversation"
          okButton="Delete"
          onCancelClick={onDeleteConfirmRequestClose}
          onOkClick={onDeleteConfirmClick}
        >
          Would you like to delete this conversation?
          <br />
          This action cannot be undone.
        </OkCancelDialog>
      )}
    </Layout>
  );
};
