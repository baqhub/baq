import {Handler} from "@baqhub/sdk";
import {FC, PropsWithChildren, ReactNode} from "react";
import {Button} from "../../core/button.js";
import {ButtonGroup} from "../../core/buttonGroup.js";
import {FormColumn, Text, tw} from "../../core/style.js";
import {Dialog} from "./dialog.js";

//
// Props.
//

interface OkCancelDialogProps extends PropsWithChildren {
  title: ReactNode;
  okButton?: ReactNode;
  onCancelClick: Handler;
  onOkClick: Handler;
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

export const OkCancelDialog: FC<OkCancelDialogProps> = props => {
  const {title, okButton, children} = props;
  const {onCancelClick, onOkClick} = props;

  return (
    <Dialog onRequestClose={onCancelClick}>
      <Layout>
        <Title>{title}</Title>
        <Text>{children}</Text>
        <ButtonGroup align="end">
          <Button size="large" onClick={onCancelClick}>
            Cancel
          </Button>
          <Button
            size="large"
            variant="primary"
            onClick={onOkClick}
            shouldAutofocus
          >
            {okButton || "Continue"}
          </Button>
        </ButtonGroup>
      </Layout>
    </Dialog>
  );
};
