import {BlobLink, FileName} from "@baqhub/sdk";
import {useCallback} from "react";
import {FileRecord} from "../baq/fileRecord.js";
import {useRecordHelpers} from "../baq/store.js";
import {useHomeContext} from "./homeState.js";

export function useFileDropState() {
  const {entity, updateRecords, uploadBlob} = useRecordHelpers();
  const {folderLink, isLoading, isUniqueItemName} = useHomeContext();

  const findUniqueFileName = useCallback(
    (fileName: string) => {
      const [name, extension] = FileName.parse(fileName);

      let iteration = 0;
      let result = fileName;

      while (!isUniqueItemName(result)) {
        if (iteration > 10) {
          return null;
        }

        result = `${name} (${(iteration += 1)})${extension}`;
      }

      return result;
    },
    [isUniqueItemName]
  );

  const onFileDrop = useCallback(
    async (file: File) => {
      const fileName = FileName.normalize(file.name);
      if (isLoading || !fileName || !file.type) {
        return;
      }

      const name = findUniqueFileName(fileName);
      if (!name) {
        return;
      }

      const blob = await uploadBlob(file);
      const record = FileRecord.new(entity, {
        blob: BlobLink.new(blob, file.type, name.trim()),
        size: blob.size,
        parent: folderLink,
      });
      updateRecords([record]);
    },
    [
      isLoading,
      findUniqueFileName,
      entity,
      folderLink,
      updateRecords,
      uploadBlob,
    ]
  );

  return {onFileDrop};
}
