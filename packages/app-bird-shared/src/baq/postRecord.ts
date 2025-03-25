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

              /** Preview card of the web link. */
              preview?: {
                title: string;
                description?: string;
                thumbnail?: {image: BlobLink<"image/jpeg">; alt?: string};
              };
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
        alt?: string;
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
            SchemaIO.object(
              {
                type: IO.literal("web_link"),
                url: SchemaIO.string({minLength: 1, maxLength: 2048}),
              },
              {
                preview: SchemaIO.object(
                  {title: SchemaIO.string({minLength: 1, maxLength: 70})},
                  {
                    description: SchemaIO.string({
                      minLength: 1,
                      maxLength: 200,
                    }),
                    thumbnail: SchemaIO.object(
                      {image: BlobLink.io("image/jpeg")},
                      {alt: SchemaIO.string({minLength: 1, maxLength: 125})}
                    ),
                  }
                ),
              }
            ),
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
          alt: SchemaIO.string({minLength: 1, maxLength: 125}),
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
  "65dc78a34ca5cbfc7a038d7934552861f1711b20f930ea0366f236b37c8e859a",
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
