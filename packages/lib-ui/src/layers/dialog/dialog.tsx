import {Handler} from "@baqhub/sdk";
import {
  FC,
  PropsWithChildren,
  ReactEventHandler,
  useEffect,
  useRef,
} from "react";
import {Grid, tw} from "../../core/style.js";
import {useLayerContext} from "../layerContext.js";
import {useLayerId} from "../layerHelpers.js";
import {DialogContent} from "./dialogContent.js";

//
// Props.
//

export interface DialogProps {
  onRequestClose: Handler;
}

//
// Style.
//

const Layout = tw.dialog`
  p-0
  bg-transparent

  backdrop:opacity-20
  backdrop:bg-neutral-900
  dark:backdrop:opacity-10
  dark:backdrop:bg-neutral-100

  outline-none
  overflow-visible
`;

const Content = tw(Grid)`
  overflow-visible
`;

//
// Component.
//

export const Dialog: FC<DialogProps & PropsWithChildren> = props => {
  const {onRequestClose, children} = props;
  const layerId = useLayerId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const {topLayerId, registerLayer} = useLayerContext();

  useEffect(() => {
    return registerLayer(layerId);
  }, [registerLayer, layerId]);

  useEffect(() => {
    const currentDialog = dialogRef.current;
    if (topLayerId !== layerId || !currentDialog) {
      return;
    }

    if (currentDialog.open) {
      return;
    }

    currentDialog.showModal();
  }, [topLayerId, layerId]);

  const onClose: ReactEventHandler<HTMLElement> = e => {
    e.preventDefault();
    onRequestClose();
  };

  const onContentClick: ReactEventHandler<HTMLElement> = e => {
    e.stopPropagation();
  };

  const isUnderLayer = topLayerId !== layerId;

  return (
    <Layout
      ref={dialogRef}
      inert={isUnderLayer ? "" : undefined}
      className={isUnderLayer ? "no-scrollbars" : undefined}
      onClose={onClose}
      onClick={onRequestClose}
    >
      <Content onClick={onContentClick}>
        <DialogContent>{children}</DialogContent>
      </Content>
    </Layout>
  );
};
