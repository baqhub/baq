import {FileRecordKey} from "../../baq/fileRecord.js";
import {useRecordByVersion} from "../../baq/store.js";

export function useCloudPickerFileState(fileKey: FileRecordKey) {
  const fileRecord = useRecordByVersion(fileKey);
  return {
    name: fileRecord.content.blob.name,
  };
}
