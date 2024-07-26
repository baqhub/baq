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
    "c4094303fe334bd18de6a1f1929c3cad"
  >;
  replyingTo?: RecordLinkOf<
    "types.baq.dev",
    "05d5b9442c36433688edca64df1a264c"
  >;
} & (
  | {
      text?: string;
      images: ReadonlyArray<{
        small: BlobLink<"image/jpeg">;
        medium: BlobLink<"image/jpeg">;
        large: BlobLink<"image/jpeg">;
        original: BlobLink<"image/jpeg">;
        width: number;
        height: number;
        size: number;
      }>;
    }
  | {text: string}
);

const RMessageRecordContent: IO.RType<MessageRecordContent> = IO.intersection([
  SchemaIO.object(
    {
      conversation: RecordLink.ioOf(
        "types.baq.dev",
        "c4094303fe334bd18de6a1f1929c3cad"
      ),
    },
    {
      replyingTo: RecordLink.ioOf(
        "types.baq.dev",
        "05d5b9442c36433688edca64df1a264c"
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
            width: SchemaIO.int({min: 1}),
            height: SchemaIO.int({min: 1}),
            size: SchemaIO.int({min: 0}),
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
  "05d5b9442c36433688edca64df1a264c",
  "48cc1ea68099b5dac78f14d9ecedc4c3420a75cbd2a96a6886d56a35afd508b9",
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
