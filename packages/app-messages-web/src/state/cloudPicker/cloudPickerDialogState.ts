import {
  Handler,
  HandlerOf,
  Q,
  QuerySortDirection,
  QuerySortProperty,
  Record,
} from "@baqhub/sdk";
import {useCallback, useState} from "react";
import {FileRecord, FileVersionHash} from "../../baq/fileRecord.js";
import {useRecordHelpers, useStaticRecordsQuery} from "../../baq/store.js";

const fileTypePath = "content.blob.type";
const fileTypes = ["image/jpeg", "image/png"];

export type FilePickHandler = HandlerOf<(signal: AbortSignal) => Promise<Blob>>;

export function useCloudPickerState(
  onFilePick: FilePickHandler,
  onRequestClose: Handler
) {
  const [selectedVersion, setSelectedVersion] = useState<FileVersionHash>();
  const {entity, downloadBlob, recordByVersion} = useRecordHelpers();

  const {getRecords} = useStaticRecordsQuery({
    pageSize: 200,
    sort: [QuerySortProperty.RECEIVED_AT, QuerySortDirection.DESCENDING],
    filter: Q.and(
      Q.author(entity),
      Q.type(FileRecord),
      Q.or(...fileTypes.map(t => Q.tag(fileTypePath, t)))
    ),
    includeLinks: [],
  });

  const getFileVersions = useCallback(
    () => getRecords().map(Record.toVersionHash),
    [getRecords]
  );

  const onFileClick = useCallback((fileVersion: FileVersionHash) => {
    setSelectedVersion(fileVersion);
  }, []);

  const onContinueClick = useCallback(() => {
    if (!selectedVersion) {
      return;
    }

    const fileRecord = recordByVersion(selectedVersion);
    const getBlob = async (signal: AbortSignal) => {
      return downloadBlob(fileRecord, fileRecord.content.blob, signal);
    };

    onRequestClose();
    onFilePick(getBlob);
  }, [
    selectedVersion,
    downloadBlob,
    recordByVersion,
    onFilePick,
    onRequestClose,
  ]);

  return {
    getFileVersions,
    selectedVersion,
    onFileClick,
    onContinueClick,
  };
}
