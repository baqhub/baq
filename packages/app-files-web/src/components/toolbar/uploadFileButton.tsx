import {Button} from "@baqhub/ui/core/button.js";
import {useFilePicker} from "@baqhub/ui/core/useFilePicker.js";
import {FC} from "react";
import {useNewFileState} from "../../state/fileDropState.js";

//
// Component.
//

export const UploadFileButton: FC = () => {
  const {onNewFile} = useNewFileState();
  const {filePicker, pickFile} = useFilePicker(onNewFile);

  return (
    <>
      <Button size="large" variant="primary" onClick={pickFile}>
        Upload file
      </Button>
      {filePicker}
    </>
  );
};
