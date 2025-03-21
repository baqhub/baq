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

      /** Enrich the text content. */
      textFacets?: ReadonlyArray<
        {
          /** Start position of the facet in Unicode code points. */
          index: number;

          /** Length of the facet in Unicode code points. */
          length: number;
        } & ExclusiveUnion<
          | {
              type: "mention";
              /** Mentioned entity. */
              mention: EntityLink;
            }
          | {
              type: "web_link";
              /** URL of the web link. */
              url: string;
            }
        >
      >;
    }
  | {
      images: ReadonlyArray<{
        small: BlobLink<"image/jpeg">;
        medium: BlobLink<"image/jpeg">;
        large: BlobLink<"image/jpeg">;
        width: number;
        height: number;
        mentions?: ReadonlyArray<{
          mention: EntityLink;
          position: {x: number; y: number};
        }>;
      }>;
    }
  | ExclusiveUnion<
      | {
          /** Other post this replies to. */
          replyToPost: RecordLinkOf<
            "types.baq.dev",
            "6f7faff90a7546e58c8f159353ab2c12"
          >;
        }
      | {
          /** Other post this quotes. */
          quotePost: RecordLinkOf<
            "types.baq.dev",
            "6f7faff90a7546e58c8f159353ab2c12"
          >;
        }
    >;

const RPostRecordContent: IO.RType<PostRecordContent> = IO.union([
  SchemaIO.object(
    {text: SchemaIO.string({minLength: 1, maxLength: 500})},
    {
      textFacets: SchemaIO.array(
        IO.intersection([
          IO.object({
            index: SchemaIO.int({min: 0}),
            length: SchemaIO.int({min: 1}),
          }),
          IO.exclusiveUnion([
            IO.object({type: IO.literal("mention"), mention: EntityLink.io()}),
            IO.object({
              type: IO.literal("web_link"),
              url: SchemaIO.string({minLength: 1, maxLength: 2048}),
            }),
          ]),
        ])
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
        "6f7faff90a7546e58c8f159353ab2c12"
      ),
    }),
    IO.object({
      quotePost: RecordLink.ioOf(
        "types.baq.dev",
        "6f7faff90a7546e58c8f159353ab2c12"
      ),
    }),
  ]),
]);

const [postRecordType, RPostRecordType] = RecordType.full(
  "types.baq.dev",
  "6f7faff90a7546e58c8f159353ab2c12",
  "b6bae8efe72af9e6064df3cfdef0679b2ac572ab39432f7e2cafa0953176bd2f",
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
