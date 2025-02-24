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
  max-h-full
  max-w-full

  bg-transparent
  p-0

  outline-none
  backdrop:bg-neutral-900
  backdrop:opacity-20
  dark:backdrop:bg-neutral-100

  dark:backdrop:opacity-10
`;

const ContentLayout = tiwi(Column)`
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
      className={isUnderLayer ? "no-scrollbars" : undefined}
      onClose={onClose}
      onClick={onRequestClose}
    >
      <ContentLayout onClick={onContentClick}>
        <DialogContent>{children}</DialogContent>
      </ContentLayout>
    </Layout>
  );
};
