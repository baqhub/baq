import {Handler} from "@baqhub/sdk";
import {
  FC,
  PropsWithChildren,
  ReactEventHandler,
  useEffect,
  useRef,
} from "react";
import tiwi from "tiwi";
import {Column} from "../../core/style.js";
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

const Layout = tiwi.dialog`
  h-full
  w-full
  max-h-full
  max-w-full

  flex
  flex-col
  items-center
  justify-center

  outline-hidden

  bg-transparent
  backdrop:bg-neutral-900
  dark:backdrop:bg-neutral-100
  backdrop:opacity-20
  dark:backdrop:opacity-10
`;

const ContentLayout = tiwi(Column)`
  min-h-0

  p-6
  sm:p-10
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
      inert={isUnderLayer}
      onClose={onClose}
      onClick={onRequestClose}
    >
      <ContentLayout onClick={onContentClick}>
        <DialogContent>{children}</DialogContent>
      </ContentLayout>
    </Layout>
  );
};
