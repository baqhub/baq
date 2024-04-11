import {FileName, Record, RecordKey} from "@baqhub/sdk";
import {useCallback} from "react";
import {FileRecord} from "../baq/fileRecord.js";
import {FolderRecord} from "../baq/folderRecord.js";
import {useRecordHelpers} from "../baq/store.js";
import {useHomeContext} from "./homeState.js";

function buildNameUpdate(
  entity: string,
  record: FolderRecord | FileRecord,
  name: string
) {
  if (Record.hasType(record, FolderRecord)) {
    return FolderRecord.update(entity, record, {
      ...record.content,
      name,
    });
  }

  return FileRecord.update(entity, record, {
    ...record.content,
    blob: {
      ...record.content.blob,
      name,
    },
  });
}

//
// Hook.
//

export function useItemActionsState(
  itemKey: RecordKey<FolderRecord | FileRecord>
) {
  const {entity, recordByKey, updateRecords} = useRecordHelpers();
  const {isUniqueItemName} = useHomeContext();

  const isValidItemName = useCallback(
    (name: string) => {
      return FileName.isValid(name) && isUniqueItemName(name);
    },
    [isUniqueItemName]
  );

  const onItemRenameRequest = useCallback(
    (name: string) => {
      const record = recordByKey(itemKey);
      const updatedRecord = buildNameUpdate(entity, record, name);
      updateRecords([updatedRecord]);
    },
    [itemKey, entity, recordByKey, updateRecords]
  );

  const onItemDeleteRequest = useCallback(() => {
    const record = recordByKey(itemKey);
    const deletedRecord = Record.delete(entity, record);
    updateRecords([deletedRecord]);
  }, [itemKey, entity, recordByKey, updateRecords]);

  return {
    isValidItemName,
    onItemRenameRequest,
    onItemDeleteRequest,
  };
}
