import {Button} from "@baqhub/ui/core/button.js";
import {useFilePicker} from "@baqhub/ui/core/useFilePicker.js";
import {FC} from "react";
import {useNewFileState} from "../../state/newFileState.js";

//
// Component.
//

export const UploadFileButton: FC = () => {
  const {isDisabled, onNewFile} = useNewFileState();
  const {filePicker, pickFile} = useFilePicker(onNewFile);

  return (
    <>
      <Button
        size="large"
        variant="primary"
        isDisabled={isDisabled}
        onClick={pickFile}
      >
        Upload file
      </Button>
      {filePicker}
    </>
  );
};
