import {Handler} from "@baqhub/sdk";
import {ButtonRow, Row, Text, tw} from "@baqhub/ui/core/style.js";
import {useDropdown} from "@baqhub/ui/layers/dropdown/useDropdown.js";
import {FC, PropsWithChildren, ReactNode} from "react";
import {FileRecordKey} from "../../baq/fileRecord.js";
import {FolderRecordKey} from "../../baq/folderRecord.js";
import {ItemActionsButton} from "./itemActionsButton.js";

//
// Props.
//

interface ItemBaseProps extends PropsWithChildren {
  itemKey: FolderRecordKey | FileRecordKey;
  itemName: string;
  icon: ReactNode;
  deleteDialogTitle: string;
  onClick: Handler;
}

//
// Style.
//

const Layout = tw(Row)`
  group
  relative
  z-0
  gap-2
`;

const ItemButton = tw(ButtonRow)`
  z-10
  peer
  grow

  p-2
  gap-1.5
  items-center
`;

const Icon = tw.div`
  shrink-0
  w-6
  h-6
  text-neutral-900
`;

const Label = tw(Text)`
  grow
  text-left
  text-md
  truncate
`;

const ActionButtons = tw(Row)`
  z-10
  shrink-0

  invisible
  group-hover:visible
  group-data-[pressed=true]:visible

  p-1
`;

const Background = tw.div`
  absolute
  z-0
  top-0
  right-0
  bottom-0
  left-0

  rounded-lg
  group-hover:bg-neutral-100
  peer-active:bg-neutral-200
  group-data-[pressed=true]:bg-neutral-200
`;

//
// Component.
//

export const ItemBase: FC<ItemBaseProps> = props => {
  const {itemKey, itemName, icon, deleteDialogTitle, onClick, children} = props;
  const dropdown = useDropdown();

  return (
    <Layout data-pressed={dropdown.isOpen}>
      <ItemButton type="button" onClick={onClick}>
        <Icon>{icon}</Icon>
        <Label>{children}</Label>
      </ItemButton>
      <ActionButtons>
        <ItemActionsButton
          itemKey={itemKey}
          itemName={itemName}
          deleteDialogTitle={deleteDialogTitle}
          dropdown={dropdown}
        />
      </ActionButtons>
      <Background />
    </Layout>
  );
};
