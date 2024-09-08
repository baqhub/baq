import {HandlerOf} from "@baqhub/sdk";
import {SubmitButton} from "@baqhub/ui/core/button.js";
import {IconButton} from "@baqhub/ui/core/iconButton.js";
import {Column, FormGrid, Row, tw} from "@baqhub/ui/core/style.js";
import {TextBox} from "@baqhub/ui/core/textBox.js";
import {useFilePicker} from "@baqhub/ui/core/useFilePicker.js";
import {resizeWithConstraints} from "@baqhub/ui/helpers/image.js";
import {DropdownItem} from "@baqhub/ui/layers/dropdown/dropdownItem.js";
import {useDropdown} from "@baqhub/ui/layers/dropdown/useDropdown.js";
import {useHasLayer} from "@baqhub/ui/layers/layerContext.js";
import {PlusIcon} from "@heroicons/react/20/solid";
import {FC, FormEvent, useCallback, useEffect, useRef, useState} from "react";
import {ConversationRecordKey} from "../../../baq/conversationRecord.js";
import {FilePickHandler} from "../../../state/cloudPicker/cloudPickerDialogState.js";
import {
  GetPendingImageData,
  useMessageComposerState,
} from "../../../state/messageComposerState.js";
import {CloudPickerDialog} from "../../cloudPicker/cloudPickerDialog.js";
import {MessageComposerImage} from "./messageComposerImage.js";

//
// Props.
//

interface MessageComposerProps {
  conversationKey: ConversationRecordKey;
  onSizeIncrease: HandlerOf<number>;
}

//
// Style.
//

const Layout = tw(Column)`
  sticky
  bottom-0

  pb-6
  bg-neutral-200
`;

const Composer = tw(FormGrid)`
  grid-cols-[auto_1fr_auto]
  grid-rows-[auto_auto]
  items-start
  p-2
  gap-x-2

  rounded-xl
  bg-white
`;

const Images = tw(Row)`
  row-start-1
  col-start-2
  pb-2

  gap-2
  overflow-x-auto
`;

const CellFileButton = tw(Column)`
  row-start-2
  col-start-1
`;

const CellTextBox = tw(Column)`
  row-start-2
  col-start-2
`;

const CellSendButton = tw(Column)`
  row-start-2
  col-start-3
`;

//
// Composer.
//

const imageConstraints = {
  small: {
    maxSize: {width: 500, height: 500},
    maxBytes: 80 * 1024, // 80kB.
  },
  medium: {
    maxSize: {width: 1200, height: 1200},
    maxBytes: 600 * 1024, // 600kB.
  },
  large: {
    maxSize: {width: 2000, height: 2000},
    maxBytes: 2 * 1024 * 1024, // 2MB.
  },
  original: {
    maxSize: {width: 10000, height: 10000},
    maxBytes: 12 * 1024 * 1024, // 12MB.
  },
  maxBytes: 50 * 1024 * 1024,
};

export const MessageComposer: FC<MessageComposerProps> = props => {
  const {conversationKey, onSizeIncrease} = props;
  const state = useMessageComposerState(conversationKey);
  const {images, text, canSend} = state;
  const {onImagePick, onImageRemove, onTextChange, onSendRequest} = state;
  const plusDropdown = useDropdown();

  //
  // Size.
  //

  const layoutRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentLayout = layoutRef.current;
    if (!currentLayout) {
      return;
    }

    let lastHeight = Number.MAX_SAFE_INTEGER;

    const observer = new ResizeObserver(entries => {
      entries.forEach(entry => {
        const newHeight = entry.borderBoxSize[0]!.blockSize;

        if (newHeight > lastHeight) {
          onSizeIncrease(newHeight - lastHeight);
        }

        lastHeight = newHeight;
      });
    });

    observer.observe(currentLayout);
    return () => {
      observer.disconnect();
    };
  }, [onSizeIncrease]);

  //
  // Focus.
  //

  const textBoxRef = useRef<HTMLInputElement>(null);
  const hasLayer = useHasLayer();

  useEffect(() => {
    const currentTextBox = textBoxRef.current;
    if (!currentTextBox || hasLayer) {
      return;
    }

    currentTextBox.focus();
  }, [conversationKey, hasLayer]);

  //
  // Images.
  //

  const renderImages = () => {
    if (images.length === 0) {
      return null;
    }

    return (
      <Images>
        {images.map(i => (
          <MessageComposerImage
            key={i.id}
            image={i}
            onRemoveClick={onImageRemove}
          />
        ))}
      </Images>
    );
  };

  const onFilePick = useCallback<FilePickHandler>(
    getBlob => {
      const getData: GetPendingImageData = async signal => {
        const blob = await getBlob(signal);
        if (blob.size > imageConstraints.maxBytes) {
          throw new Error("Blob too big.");
        }

        // Build thumbnails.
        const [
          [smallBlob],
          [mediumBlob],
          [largeBlob],
          [originalBlob, imageSize],
        ] = await Promise.all([
          resizeWithConstraints(
            blob,
            imageConstraints.small.maxSize,
            imageConstraints.small.maxBytes,
            0.6
          ),
          resizeWithConstraints(
            blob,
            imageConstraints.medium.maxSize,
            imageConstraints.medium.maxBytes,
            0.75
          ),
          resizeWithConstraints(
            blob,
            imageConstraints.large.maxSize,
            imageConstraints.large.maxBytes,
            0.8
          ),
          resizeWithConstraints(
            blob,
            imageConstraints.original.maxSize,
            imageConstraints.original.maxBytes,
            0.8
          ),
        ]);

        return {
          imageSize,
          originalBlob,
          smallBlob,
          mediumBlob,
          largeBlob,
        };
      };

      onImagePick(getData);
    },
    [onImagePick]
  );

  const onLocalFilePick = useCallback(
    (blob: Blob) => {
      const getBlob = () => Promise.resolve(blob);
      onFilePick(getBlob);
    },
    [onFilePick]
  );

  const {filePicker, pickFile} = useFilePicker(onLocalFilePick, "image/*");
  const [isCloudPickerOpen, setIsCloudPickerOpen] = useState(false);

  //
  // Form.
  //

  const onFormSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!canSend) {
      return;
    }

    onSendRequest();
  };

  return (
    <Layout ref={layoutRef}>
      <Composer onSubmit={onFormSubmit}>
        {renderImages()}
        <CellFileButton>
          <IconButton
            ref={plusDropdown.setReference}
            size="medium"
            variant="circle"
            isPressed={plusDropdown.isOpen}
            onClick={plusDropdown.open}
          >
            <PlusIcon />
          </IconButton>
        </CellFileButton>
        <CellTextBox>
          <TextBox
            ref={textBoxRef}
            size="medium"
            placeholder="Message..."
            value={text}
            onChange={onTextChange}
          />
        </CellTextBox>
        <CellSendButton>
          <SubmitButton size="medium" variant="primary" isDisabled={!canSend}>
            Send
          </SubmitButton>
        </CellSendButton>
      </Composer>
      {plusDropdown.render(() => (
        <>
          <DropdownItem onClick={pickFile}>Upload new</DropdownItem>
          <DropdownItem onClick={() => setIsCloudPickerOpen(true)}>
            Browse existing files
          </DropdownItem>
        </>
      ))}
      {filePicker}
      {isCloudPickerOpen && (
        <CloudPickerDialog
          onFilePick={onFilePick}
          onRequestClose={() => setIsCloudPickerOpen(false)}
        />
      )}
    </Layout>
  );
};
