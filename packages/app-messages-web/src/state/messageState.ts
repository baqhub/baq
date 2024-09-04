import {useMemo} from "react";
import {MessageRecord, MessageRecordKey} from "../baq/messageRecord.js";
import {useRecordByKey, useRecordHelpers} from "../baq/store.js";

type MessageRecordImage = Extract<
  MessageRecord["content"],
  {images: any}
>["images"][0];

export interface MessageImage {
  url: string;
  width: number;
  height: number;
}

export interface ImageVisualMessageContent {
  images: ReadonlyArray<MessageImage>;
  text?: string;
}

export interface TextVisualMessageContent {
  text: string;
}

export type VisualMessageContent =
  | ImageVisualMessageContent
  | TextVisualMessageContent;

export function useMessageState(messageKey: MessageRecordKey) {
  const {entity, buildBlobUrl} = useRecordHelpers();
  const message = useRecordByKey(messageKey);

  const content = useMemo((): VisualMessageContent => {
    if ("images" in message.content) {
      const imageToMessageImage = (
        image: MessageRecordImage
      ): MessageImage => ({
        url: buildBlobUrl(message, image.medium),
        width: image.originalWidth,
        height: image.originalHeight,
      });

      return {
        images: message.content.images.map(imageToMessageImage),
        text: message.content.text,
      };
    }

    return {text: message.content.text};
  }, [buildBlobUrl, message]);

  return {
    isSelfMessage: entity === message.author.entity,
    content,
    onDeleteClick: () => {},
  };
}
