import {useCallback} from "react";
import {FolderRecordKey} from "../baq/folderRecord.js";
import {useRecordByKey} from "../baq/store.js";
import {useHomeContext} from "./homeState.js";

export function useFolderItemState(folderKey: FolderRecordKey) {
  const {onFolderClick} = useHomeContext();
  const record = useRecordByKey(folderKey);
  const name = record.content.name;

  const onClick = useCallback(() => {
    onFolderClick(folderKey);
  }, [onFolderClick, folderKey]);

  return {name, onClick};
}
