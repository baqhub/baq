import {unreachable} from "@baqhub/sdk";
import {FC} from "react";
import {ItemKey} from "../state/homeState.js";
import {ItemKeyModelType, useItemState} from "../state/itemState.js";
import {FileItem} from "./items/fileItem.js";
import {FolderItem} from "./items/folderItem.js";

//
// Props.
//

interface ItemProps {
  itemKey: ItemKey;
}

//
// Component.
//

export const Item: FC<ItemProps> = ({itemKey}) => {
  const {itemKeyModel} = useItemState(itemKey);

  switch (itemKeyModel.type) {
    case ItemKeyModelType.FOLDER:
      return <FolderItem folderKey={itemKeyModel.key} />;

    case ItemKeyModelType.FILE:
      return <FileItem fileKey={itemKeyModel.key} />;

    default:
      unreachable(itemKeyModel);
  }
};
