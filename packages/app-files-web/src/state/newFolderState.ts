import {FileName} from "@baqhub/sdk";
import {useCallback} from "react";
import {FolderRecord} from "../baq/folderRecord.js";
import {useRecordHelpers} from "../baq/store.js";
import {useHomeContext} from "./homeState.js";

export function useNewFolderButtonState() {
  const {entity, updateRecords} = useRecordHelpers();
  const {folderLink, isLoading, isUniqueItemName} = useHomeContext();

  const isValidFolderName = useCallback(
    (name: string) => {
      return FileName.isValid(name) && isUniqueItemName(name);
    },
    [isUniqueItemName]
  );

  const onFolderCreateRequest = useCallback(
    (name: string) => {
      if (!isValidFolderName(name)) {
        return;
      }

      // New record.
      const record = FolderRecord.new(entity, {
        name: name.trim(),
        parent: folderLink,
      });

      updateRecords([record]);
    },
    [isValidFolderName, entity, folderLink, updateRecords]
  );

  return {
    isDisabled: isLoading,
    isValidFolderName,
    onFolderCreateRequest,
  };
}
