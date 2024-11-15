import {useSearchDialogState} from "@baqhub/bird-shared/state/searchDialogState.js";
import {Handler, HandlerOf} from "@baqhub/sdk";
import {Button, SubmitButton} from "@baqhub/ui/core/button.js";
import {ButtonGroup} from "@baqhub/ui/core/buttonGroup.js";
import {FormColumn, Text} from "@baqhub/ui/core/style.js";
import {TextBox} from "@baqhub/ui/core/textBox.js";
import {Dialog} from "@baqhub/ui/layers/dialog/dialog.js";
import {FC, FormEvent, useCallback} from "react";
import tiwi from "tiwi";

//
// Props.
//

interface SearchDialogProps {
  onEntityFound: HandlerOf<string>;
  onRequestClose: Handler;
}

//
// Style.
//

const Layout = tiwi(FormColumn)`
  w-96
  max-w-full
  gap-3
`;

const Title = tiwi(Text)`
  text-2xl
  font-semibold
`;

//
// Component.
//

export const SearchDialog: FC<SearchDialogProps> = props => {
  const {onEntityFound, onRequestClose} = props;

  const onSearchEntityFound = useCallback(
    (entity: string) => {
      onEntityFound(entity);
      onRequestClose();
    },
    [onEntityFound, onRequestClose]
  );

  const state = useSearchDialogState(onSearchEntityFound);
  const {isResolving, entity} = state;
  const {onEntityChange, onResolutionRequest} = state;

  const onDialogRequestClose = () => {
    if (isResolving) {
      return;
    }

    onRequestClose();
  };

  const onFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    onResolutionRequest();
  };

  return (
    <Dialog onRequestClose={onDialogRequestClose}>
      <Layout onSubmit={onFormSubmit}>
        <Title>Search for a user</Title>
        <TextBox
          size="large"
          placeholder="user.host.com"
          value={entity}
          onChange={onEntityChange}
          variant="entity"
          isDisabled={isResolving}
          isSelected
        />
        <ButtonGroup align="end">
          <Button
            size="large"
            onClick={onRequestClose}
            isDisabled={isResolving}
          >
            Cancel
          </Button>
          <SubmitButton size="large" variant="primary" isDisabled={isResolving}>
            Search
          </SubmitButton>
        </ButtonGroup>
      </Layout>
    </Dialog>
  );
};
