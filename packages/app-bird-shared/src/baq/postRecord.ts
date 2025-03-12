/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import {
  BlobLink,
  EntityLink,
  ExclusiveUnion,
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

export type PostRecordContent =
  | {
      /** Text content of the post. */
      text: string;
      textMentions?: ReadonlyArray<{
        /** Mentioned entity. */
        mention: EntityLink;

        /** Start position of the mention in Unicode code points. */
        index: number;

        /** Length of the mention in Unicode code points. */
        length: number;
      }>;
      textLinks?: ReadonlyArray<{
        /** URL of the link. */
        url: string;

        /** Start position of the link in Unicode code points. */
        index: number;

        /** Length of the link in Unicode code points. */
        length: number;
      }>;
    }
  | {
      images: ReadonlyArray<{
        small: BlobLink<"image/jpeg">;
        medium: BlobLink<"image/jpeg">;
        large: BlobLink<"image/jpeg">;
        width: number;
        height: number;
        size: number;
        mentions?: ReadonlyArray<{
          mention: EntityLink;
          position: {x: number; y: number};
        }>;
      }>;
    }
  | ExclusiveUnion<
      | {
          /** Other Post record this replies to. */
          replyToPost: RecordLinkOf<
            "types.baq.dev",
            "d8fe40d469e0455c896b058a043829bf"
          >;
        }
      | {
          /** Other Post record this quotes. */
          quotePost: RecordLinkOf<
            "types.baq.dev",
            "d8fe40d469e0455c896b058a043829bf"
          >;
        }
    >;

const RPostRecordContent: IO.RType<PostRecordContent> = IO.union([
  SchemaIO.object(
    {text: SchemaIO.string({minLength: 1, maxLength: 500})},
    {
      textMentions: SchemaIO.array(
        IO.object({
          mention: EntityLink.io(),
          index: SchemaIO.int({min: 0}),
          length: SchemaIO.int({min: 1}),
        })
      ),
      textLinks: SchemaIO.array(
        IO.object({
          url: SchemaIO.string({minLength: 1, maxLength: 2048}),
          index: SchemaIO.int({min: 1}),
          length: SchemaIO.int({min: 1}),
        })
      ),
    }
  ),
  IO.object({
    images: SchemaIO.array(
      SchemaIO.object(
        {
          small: BlobLink.io("image/jpeg"),
          medium: BlobLink.io("image/jpeg"),
          large: BlobLink.io("image/jpeg"),
          width: SchemaIO.int({min: 1}),
          height: SchemaIO.int({min: 1}),
          size: SchemaIO.int({min: 0}),
        },
        {
          mentions: SchemaIO.array(
            IO.object({
              mention: EntityLink.io(),
              position: IO.object({
                x: SchemaIO.int({min: 0}),
                y: SchemaIO.int({min: 0}),
              }),
            })
          ),
        }
      ),
      {minItems: 1, maxItems: 4}
    ),
  }),
  IO.exclusiveUnion([
    IO.object({
      replyToPost: RecordLink.ioOf(
        "types.baq.dev",
        "d8fe40d469e0455c896b058a043829bf"
      ),
    }),
    IO.object({
      quotePost: RecordLink.ioOf(
        "types.baq.dev",
        "d8fe40d469e0455c896b058a043829bf"
      ),
    }),
  ]),
]);

const [postRecordType, RPostRecordType] = RecordType.full(
  "types.baq.dev",
  "d8fe40d469e0455c896b058a043829bf",
  "9b55d28b043def185af3ba0bcf489d128478e61c34116a408c921eafb4329a77",
  RPostRecordContent
);

const RPostRecord = Record.io(
  postRecordType,
  RPostRecordType,
  RPostRecordContent
);

export interface PostRecord extends IO.TypeOf<typeof RPostRecord> {}
export const PostRecord = Record.ioClean<PostRecord>(RPostRecord);
export type PostRecordLink = RecordLink<PostRecord>;
export type PostRecordKey = RecordKey<PostRecord>;
export type PostVersionHash = VersionHash<PostRecord>;
