import {Handler, HandlerOf, PredicateOf} from "@baqhub/sdk";
import {Button, SubmitButton} from "@baqhub/ui/core/button.js";
import {ButtonGroup} from "@baqhub/ui/core/buttonGroup.js";
import {FormColumn, Text, tw} from "@baqhub/ui/core/style.js";
import {TextBox} from "@baqhub/ui/core/textBox.js";
import {Dialog} from "@baqhub/ui/layers/dialog/dialog.js";
import {FC, FormEvent, useState} from "react";

//
// Props.
//

interface NewFolderDialogProps {
  onRequestClose: Handler;
  isValidFolderName: PredicateOf<string>;
  onFolderCreateRequest: HandlerOf<string>;
}

//
// Style.
//

const Layout = tw(FormColumn)`
  w-96
  gap-3
`;

const Title = tw(Text)`
  text-2xl
  font-semibold
`;

//
// Component.
//

export const NewFolderDialog: FC<NewFolderDialogProps> = props => {
  const {onRequestClose, isValidFolderName, onFolderCreateRequest} = props;
  const [folderName, setFolderName] = useState("");

  const canCreateFolder = isValidFolderName(folderName);

  const onFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    onRequestClose();
    onFolderCreateRequest(folderName);
  };

  return (
    <Dialog onRequestClose={onRequestClose}>
      <Layout onSubmit={onFormSubmit}>
        <Title>New folder</Title>
        <TextBox
          size="large"
          placeholder="Folder name..."
          value={folderName}
          onChange={setFolderName}
        />
        <ButtonGroup align="end">
          <Button size="large" onClick={onRequestClose}>
            Cancel
          </Button>
          <SubmitButton
            size="large"
            variant="primary"
            isDisabled={!canCreateFolder}
          >
            Create
          </SubmitButton>
        </ButtonGroup>
      </Layout>
    </Dialog>
  );
};
