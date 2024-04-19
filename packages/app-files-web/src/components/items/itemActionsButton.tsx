import {IconButton} from "@baqhub/ui/core/iconButton.js";
import {Grid, Text, tw} from "@baqhub/ui/core/style.js";
import {OkCancelDialog} from "@baqhub/ui/layers/dialog/okCancelDialog.js";
import {DropdownItem} from "@baqhub/ui/layers/dropdown/dropdownItem.js";
import {useDropdown} from "@baqhub/ui/layers/dropdown/useDropdown.js";
import {EllipsisHorizontalIcon} from "@heroicons/react/24/outline";
import {FC, useState} from "react";
import {FileRecordKey} from "../../baq/fileRecord.js";
import {FolderRecordKey} from "../../baq/folderRecord.js";
import {useItemActionsState} from "../../state/itemActionsState.js";
import {RenameDialog} from "./renameDialog.js";

//
// Props.
//

interface ItemActionsProps {
  itemKey: FolderRecordKey | FileRecordKey;
  itemName: string;
  deleteDialogTitle: string;
  dropdown: ReturnType<typeof useDropdown>;
}

//
// Style.
//

const ItemName = tw(Text)`
  inline-block
  max-w-[20ch]
  align-bottom

  font-semibold
  truncate
`;

//
// Component.
//

export const ItemActionsButton: FC<ItemActionsProps> = props => {
  const {itemKey, itemName, deleteDialogTitle, dropdown} = props;
  const itemActionsState = useItemActionsState(itemKey);

  //
  // Dropdown.
  //

  const onRenameItemClick = () => {
    setIsRenameDialogOpen(true);
  };

  const onDeleteItemClick = () => {
    setIsDeleteConfirmOpen(true);
  };

  //
  // Rename dialog.
  //

  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const {isValidItemName, onItemRenameRequest} = itemActionsState;

  const onRenameDialogRequestClose = () => {
    setIsRenameDialogOpen(false);
  };

  const onRenameDialogItemRenameRequest = (name: string) => {
    onRenameDialogRequestClose();
    onItemRenameRequest(name);
  };

  //
  // Delete confirmation.
  //

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const {onItemDeleteRequest} = itemActionsState;

  const onDeleteConfirmRequestClose = () => {
    setIsDeleteConfirmOpen(false);
  };

  const onDeleteConfirmClick = () => {
    onDeleteConfirmRequestClose();
    onItemDeleteRequest();
  };

  return (
    <>
      <Grid ref={dropdown.setReference}>
        <IconButton onClick={dropdown.open} isPressed={dropdown.isOpen}>
          <EllipsisHorizontalIcon />
        </IconButton>
      </Grid>
      {isRenameDialogOpen && (
        <RenameDialog
          initialName={itemName}
          onRequestClose={onRenameDialogRequestClose}
          isValidItemName={isValidItemName}
          onItemRenameRequest={onRenameDialogItemRenameRequest}
        />
      )}
      {dropdown.render(() => (
        <>
          <DropdownItem onClick={onRenameItemClick}>Rename</DropdownItem>
          <DropdownItem onClick={onDeleteItemClick}>Delete</DropdownItem>
        </>
      ))}
      {isDeleteConfirmOpen && (
        <OkCancelDialog
          title={deleteDialogTitle}
          okButton="Delete"
          onCancelClick={onDeleteConfirmRequestClose}
          onOkClick={onDeleteConfirmClick}
        >
          Would you like to delete <ItemName>{itemName}</ItemName>
          ?
          <br />
          This action cannot be undone.
        </OkCancelDialog>
      )}
    </>
  );
};
