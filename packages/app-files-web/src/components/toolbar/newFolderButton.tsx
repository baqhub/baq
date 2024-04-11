import {Button} from "@baqhub/ui/core/button.js";
import {FC, useState} from "react";
import {useNewFolderButtonState} from "../../state/newFolderState.js";
import {NewFolderDialog} from "./newFolderDialog.js";

//
// Component.
//

export const NewFolderButton: FC = () => {
  const newFolderButtonState = useNewFolderButtonState();
  const {isDisabled} = newFolderButtonState;
  const {isValidFolderName, onFolderCreateRequest} = newFolderButtonState;

  const [isDialogVisible, setIsDialogVisible] = useState(false);

  return (
    <>
      <Button
        size="large"
        variant="primary"
        isDisabled={isDisabled}
        onClick={() => setIsDialogVisible(true)}
      >
        New folder
      </Button>
      {isDialogVisible && (
        <NewFolderDialog
          isValidFolderName={isValidFolderName}
          onFolderCreateRequest={onFolderCreateRequest}
          onRequestClose={() => setIsDialogVisible(false)}
        />
      )}
    </>
  );
};
