import {Record, RecordKey} from "@baqhub/sdk";
import {FileRecord} from "../baq/fileRecord.js";
import {FolderRecord} from "../baq/folderRecord.js";
import {useRecordByKey} from "../baq/store.js";

//
// View model.
//

export enum ItemKeyModelType {
  FOLDER = "folder",
  FILE = "file",
}

export interface FolderKeyModel {
  type: ItemKeyModelType.FOLDER;
  key: RecordKey<FolderRecord>;
}

export interface FileKeyModel {
  type: ItemKeyModelType.FILE;
  key: RecordKey<FileRecord>;
}

export type ItemKeyModel = FolderKeyModel | FileKeyModel;

//
// Hook.
//

function recordToItemKey(record: FolderRecord | FileRecord): ItemKeyModel {
  if (Record.hasType(record, FolderRecord)) {
    return {
      type: ItemKeyModelType.FOLDER,
      key: Record.toKey(record),
    };
  }

  return {
    type: ItemKeyModelType.FILE,
    key: Record.toKey(record),
  };
}

export function useItemState(itemKey: RecordKey<FolderRecord | FileRecord>) {
  const itemRecord = useRecordByKey(itemKey);
  const itemKeyModel = recordToItemKey(itemRecord);
  return {itemKeyModel};
}
