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
      text: string;
      textMentions?: ReadonlyArray<{
        mention: EntityLink;
        index: number;
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
      }>;
      imageMentions?: ReadonlyArray<{
        mention: EntityLink;
        position: {x: number; y: number};
      }>;
    }
  | ExclusiveUnion<
      | {
          replyToPost: RecordLinkOf<
            "types.baq.dev",
            "6ee7f69a90154b849bac528daa942bcd"
          >;
        }
      | {
          quotePost: RecordLinkOf<
            "types.baq.dev",
            "6ee7f69a90154b849bac528daa942bcd"
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
    }
  ),
  SchemaIO.object(
    {
      images: SchemaIO.array(
        IO.object({
          small: BlobLink.io("image/jpeg"),
          medium: BlobLink.io("image/jpeg"),
          large: BlobLink.io("image/jpeg"),
          width: SchemaIO.int({min: 1}),
          height: SchemaIO.int({min: 1}),
          size: SchemaIO.int({min: 0}),
        }),
        {minItems: 1, maxItems: 4}
      ),
    },
    {
      imageMentions: SchemaIO.array(
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
  IO.exclusiveUnion([
    IO.object({
      replyToPost: RecordLink.ioOf(
        "types.baq.dev",
        "6ee7f69a90154b849bac528daa942bcd"
      ),
    }),
    IO.object({
      quotePost: RecordLink.ioOf(
        "types.baq.dev",
        "6ee7f69a90154b849bac528daa942bcd"
      ),
    }),
  ]),
]);

const [postRecordType, RPostRecordType] = RecordType.full(
  "types.baq.dev",
  "6ee7f69a90154b849bac528daa942bcd",
  "2d196fe0c3395e6767cf0c0d0f0fa74aa618d4c41d73f31cd3f244caed252974",
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
