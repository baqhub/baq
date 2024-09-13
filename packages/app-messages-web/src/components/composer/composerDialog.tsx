import {Handler} from "@baqhub/sdk";
import {Button, SubmitButton} from "@baqhub/ui/core/button.js";
import {ButtonGroup} from "@baqhub/ui/core/buttonGroup.js";
import {FormColumn, Text, tw} from "@baqhub/ui/core/style.js";
import {TextBox} from "@baqhub/ui/core/textBox.js";
import {Dialog} from "@baqhub/ui/layers/dialog/dialog.js";
import {FC, FormEvent, useCallback} from "react";
import {useComposerState} from "../../state/composerState.js";
import {ConversationSelectHandler} from "../../state/homeState.js";

//
// Props.
//

interface ComposerDialogProps {
  onConversationSelect: ConversationSelectHandler;
  onRequestClose: Handler;
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

export const ComposerDialog: FC<ComposerDialogProps> = props => {
  const {onConversationSelect, onRequestClose} = props;

  const onConversationCreated = useCallback<ConversationSelectHandler>(
    conversationKey => {
      onConversationSelect(conversationKey);
      onRequestClose();
    },
    [onConversationSelect, onRequestClose]
  );

  const composerState = useComposerState(onConversationCreated);
  const {isResolving, recipient} = composerState;
  const {onRecipientChange, onResolutionRequest} = composerState;

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
        <Title>New conversation</Title>
        <TextBox
          size="large"
          placeholder="user.domain.com"
          value={recipient}
          onChange={onRecipientChange}
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
            Continue
          </SubmitButton>
        </ButtonGroup>
      </Layout>
    </Dialog>
  );
};
