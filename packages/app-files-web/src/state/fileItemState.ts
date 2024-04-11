import {FileName, RecordKey} from "@baqhub/sdk";
import {useCallback, useMemo} from "react";
import {FileRecord} from "../baq/fileRecord.js";
import {useRecordByKey, useRecordHelpers} from "../baq/store.js";

const expiresInSeconds = 3 * 60 * 60; // 3 hours.

//
// Hook.
//

export function useFileItemState(fileKey: RecordKey<FileRecord>) {
  const {buildBlobUrl} = useRecordHelpers();
  const record = useRecordByKey(fileKey);
  const name = record.content.blob.name;

  const extension = useMemo(() => {
    const [_, ext] = FileName.parse(name);
    return ext;
  }, [name]);

  const buildDownloadUrl = useCallback(() => {
    return buildBlobUrl(record, record.content.blob, expiresInSeconds);
  }, [buildBlobUrl, record]);

  return {name, extension, buildDownloadUrl};
}
