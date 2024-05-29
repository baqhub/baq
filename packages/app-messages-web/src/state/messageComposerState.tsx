import {BlobLink, Record, Str, isDefined} from "@baqhub/sdk";
import {abortable} from "@baqhub/sdk-react";
import {Size} from "@baqhub/ui/helpers/image.js";
import {useCallback, useEffect, useState} from "react";
import {ConversationRecordKey} from "../baq/conversationRecord.js";
import {MessageRecord, MessageRecordContent} from "../baq/messageRecord.js";
import {useRecordHelpers} from "../baq/store.js";

type MessageRecordImage = Extract<
  MessageRecord["content"],
  {images: any}
>["images"][0];

export interface PendingImageData {
  imageSize: Size;
  originalBlob: Blob;
  smallBlob: Blob;
  mediumBlob: Blob;
  largeBlob: Blob;
}

export type GetPendingImageData = (
  signal: AbortSignal
) => Promise<PendingImageData>;

export interface PendingImage {
  id: string;
  data: {
    id: string;
    getData: GetPendingImageData;
  };
  thumbnail: Blob | undefined;
  image: MessageRecordImage | undefined;
}

export function useMessageComposerState(
  conversationKey: ConversationRecordKey
) {
  const {entity, recordByKey, updateRecords, uploadBlob} = useRecordHelpers();
  const [images, setImages] = useState<ReadonlyArray<PendingImage>>([]);
  const [text, setText] = useState("");

  const pendingToUpload = images.find(i => !i.image)?.data;
  const canSend = !pendingToUpload && (images.length > 0 || text);

  const onImagePick = useCallback((getData: GetPendingImageData) => {
    const id = Str.random(5);
    setImages(value => [
      ...value,
      {id, data: {id, getData}, thumbnail: undefined, image: undefined},
    ]);
  }, []);

  const onThumbnail = useCallback((id: string, thumbnail: Blob) => {
    setImages(value =>
      value.map(pending => {
        if (pending.id !== id) {
          return pending;
        }

        return {
          ...pending,
          thumbnail,
        };
      })
    );
  }, []);

  const onImageUpload = useCallback((id: string, image: MessageRecordImage) => {
    setImages(value =>
      value.map(pending => {
        if (pending.id !== id) {
          return pending;
        }

        return {
          ...pending,
          image,
        };
      })
    );
  }, []);

  const onImageRemove = useCallback((image: PendingImage) => {
    setImages(value => value.filter(i => i !== image));
  }, []);

  //
  // Upload images.
  //

  useEffect(() => {
    if (!pendingToUpload) {
      return;
    }

    return abortable(async signal => {
      const {id, getData} = pendingToUpload;
      const data = await getData(signal);
      const {imageSize, originalBlob, smallBlob, mediumBlob, largeBlob} = data;
      onThumbnail(id, smallBlob);

      const [smallResponse, mediumResponse, largeResponse, originalResponse] =
        await Promise.all([
          uploadBlob(smallBlob, signal),
          uploadBlob(mediumBlob, signal),
          uploadBlob(largeBlob, signal),
          uploadBlob(originalBlob, signal),
        ]);

      const image: MessageRecordImage = {
        small: BlobLink.new(smallResponse, "image/jpeg", `${id}_small.jpg`),
        medium: BlobLink.new(mediumResponse, "image/jpeg", `${id}_medium.jpg`),
        large: BlobLink.new(largeResponse, "image/jpeg", `${id}_large.jpg`),
        original: BlobLink.new(
          originalResponse,
          "image/jpeg",
          `${id}_original.jpg`
        ),
        size: originalResponse.size,
        width: imageSize.width,
        height: imageSize.height,
      };

      onImageUpload(id, image);
    });
  }, [uploadBlob, pendingToUpload, onThumbnail, onImageUpload]);

  const onSendRequest = useCallback(() => {
    // Create the new message record.
    const conversation = recordByKey(conversationKey);
    const conversationLink = Record.toLink(conversation);

    const buildMessageContent = (): MessageRecordContent => {
      const uploadedImages = images.map(i => i.image).filter(isDefined);
      if (uploadedImages.length !== images.length) {
        throw new Error("Images still uploading.");
      }

      if (uploadedImages.length > 0) {
        return {
          conversation: conversationLink,
          images: uploadedImages,
          text: text || undefined,
        };
      }

      if (text) {
        return {
          conversation: conversationLink,
          text,
        };
      }

      throw new Error("Nothing to send in message.");
    };

    const updatedConversation = Record.toSynced(conversation);
    const message = MessageRecord.new(entity, buildMessageContent(), {
      permissions: {...conversation.permissions, write: undefined},
    });

    // Add it to the state.
    updateRecords([updatedConversation, message]);

    // Clear the field.
    setImages([]);
    setText("");
  }, [entity, recordByKey, updateRecords, conversationKey, text, images]);

  return {
    images,
    text,
    canSend,
    onImagePick,
    onImageRemove,
    onTextChange: setText,
    onSendRequest,
  };
}
