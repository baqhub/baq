/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import {
  BlobLink,
  IO,
  Record,
  RecordKey,
  RecordLink,
  RecordLinkOf,
  RecordType,
  SchemaIO,
  VersionHash,
} from "@baqhub/sdk";

//
// Model.
//

export type MessageRecordContent = {
  conversation: RecordLinkOf<
    "types.baq.dev",
    "7583995c51cf44ad972fdc123105e1dc"
  >;
  replyingTo?: RecordLinkOf<
    "types.baq.dev",
    "153b3cb3a2f0494e950599de1cc13ef3"
  >;
} & (
  | {
      text?: string;
      images: ReadonlyArray<{
        small: BlobLink<"image/jpeg">;
        medium: BlobLink<"image/jpeg">;
        large: BlobLink<"image/jpeg">;
        original: BlobLink<"image/jpeg">;
        originalWidth: number;
        originalHeight: number;
        originalSize: number;
      }>;
    }
  | {text: string}
);

const RMessageRecordContent: IO.RType<MessageRecordContent> = IO.intersection([
  SchemaIO.object(
    {
      conversation: RecordLink.ioOf(
        "types.baq.dev",
        "7583995c51cf44ad972fdc123105e1dc"
      ),
    },
    {
      replyingTo: RecordLink.ioOf(
        "types.baq.dev",
        "153b3cb3a2f0494e950599de1cc13ef3"
      ),
    }
  ),
  IO.union([
    SchemaIO.object(
      {
        images: SchemaIO.array(
          IO.object({
            small: BlobLink.io("image/jpeg"),
            medium: BlobLink.io("image/jpeg"),
            large: BlobLink.io("image/jpeg"),
            original: BlobLink.io("image/jpeg"),
            originalWidth: SchemaIO.int({min: 1}),
            originalHeight: SchemaIO.int({min: 1}),
            originalSize: SchemaIO.int({min: 0}),
          }),
          {minItems: 1, maxItems: 20}
        ),
      },
      {text: SchemaIO.string({minLength: 1, maxLength: 4096})}
    ),
    IO.object({text: SchemaIO.string({minLength: 1, maxLength: 4096})}),
  ]),
]);

const [messageRecordType, RMessageRecordType] = RecordType.full(
  "types.baq.dev",
  "153b3cb3a2f0494e950599de1cc13ef3",
  "a1f3b94d2f9f35654e8aa87ee07eeb04f9acda9a360847422ae80d6d29cd65cf",
  RMessageRecordContent
);

const RMessageRecord = Record.io(
  messageRecordType,
  RMessageRecordType,
  RMessageRecordContent
);

export interface MessageRecord extends IO.TypeOf<typeof RMessageRecord> {}
export const MessageRecord = Record.ioClean<MessageRecord>(RMessageRecord);
export type MessageRecordLink = RecordLink<MessageRecord>;
export type MessageRecordKey = RecordKey<MessageRecord>;
export type MessageVersionHash = VersionHash<MessageRecord>;
