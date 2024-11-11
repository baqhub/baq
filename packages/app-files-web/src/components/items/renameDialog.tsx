import {Handler, HandlerOf, PredicateOf} from "@baqhub/sdk";
import {Button, SubmitButton} from "@baqhub/ui/core/button.js";
import {ButtonGroup} from "@baqhub/ui/core/buttonGroup.js";
import {FormColumn, Text} from "@baqhub/ui/core/style.js";
import {TextBox} from "@baqhub/ui/core/textBox.js";
import {Dialog} from "@baqhub/ui/layers/dialog/dialog.js";
import {FC, FormEvent, useState} from "react";
import tiwi from "tiwi";

//
// Props.
//

interface RenameDialogProps {
  initialName: string;
  onRequestClose: Handler;
  isValidItemName: PredicateOf<string>;
  onItemRenameRequest: HandlerOf<string>;
}

//
// Style.
//

const Layout = tiwi(FormColumn)`
  w-96
  gap-3
`;

const Title = tiwi(Text)`
  text-2xl
  font-semibold
`;

//
// Component.
//

export const RenameDialog: FC<RenameDialogProps> = props => {
  const {onRequestClose, isValidItemName, onItemRenameRequest} = props;
  const [itemName, setItemName] = useState(props.initialName);

  const canRenameItem = isValidItemName(itemName);

  const onFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    onRequestClose();
    onItemRenameRequest(itemName);
  };

  return (
    <Dialog onRequestClose={onRequestClose}>
      <Layout onSubmit={onFormSubmit}>
        <Title>New folder</Title>
        <TextBox
          size="large"
          placeholder="Item name..."
          value={itemName}
          onChange={setItemName}
          isSelected
        />
        <ButtonGroup align="end">
          <Button size="large" onClick={onRequestClose}>
            Cancel
          </Button>
          <SubmitButton
            size="large"
            variant="primary"
            isDisabled={!canRenameItem}
          >
            Rename
          </SubmitButton>
        </ButtonGroup>
      </Layout>
    </Dialog>
  );
};
