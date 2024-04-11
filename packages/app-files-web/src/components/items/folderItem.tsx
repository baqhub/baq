import {FolderIcon} from "@heroicons/react/24/outline";
import {FC} from "react";
import {FolderRecordKey} from "../../baq/folderRecord.js";
import {useFolderItemState} from "../../state/folderItemState.js";
import {ItemBase} from "./itemBase.js";

//
// Props.
//

interface FolderItemProps {
  folderKey: FolderRecordKey;
}

//
// Component.
//

export const FolderItem: FC<FolderItemProps> = ({folderKey}) => {
  const {name, onClick} = useFolderItemState(folderKey);

  return (
    <ItemBase
      itemKey={folderKey}
      itemName={name}
      icon={<FolderIcon />}
      deleteDialogTitle="Delete folder"
      onClick={onClick}
    >
      {name}
    </ItemBase>
  );
};
