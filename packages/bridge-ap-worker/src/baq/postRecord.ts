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
  TagLink,
  VersionHash,
} from "@baqhub/sdk";

//
// Model.
//

export type PostRecordContent = (
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
        } & (
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
        )
      >;
    }
  | {
      media:
        | {
            type: TagLink<"web_link_preview">;
            /** URL of the web link. */
            url: string;
            title: string;
            description?: string;
            thumbnail?: {image: BlobLink<"image/jpeg">; alt?: string};
          }
        | {
            type: TagLink<"images">;
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
          };
    }
) &
  ExclusiveUnion<
    | {
        /** Other post this replies to. */
        replyToPost?: RecordLinkOf<
          "types.baq.dev",
          "9ff7bc7c66a04f3fb2c2078e7d696a46"
        >;
      }
    | {
        /** Other post this quotes. */
        quotePost?: RecordLinkOf<
          "types.baq.dev",
          "9ff7bc7c66a04f3fb2c2078e7d696a46"
        >;
      }
  >;

const RPostRecordContent: IO.RType<PostRecordContent> = IO.intersection([
  IO.union([
    SchemaIO.object(
      {text: SchemaIO.string({minLength: 1, maxLength: 500})},
      {
        textFacets: SchemaIO.array(
          IO.intersection([
            IO.object({
              index: SchemaIO.int({min: 0}),
              length: SchemaIO.int({min: 1}),
            }),
            IO.union([
              IO.object({
                type: IO.literal("mention"),
                mention: EntityLink.io(),
              }),
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
      media: IO.union([
        SchemaIO.object(
          {
            type: TagLink.io("web_link_preview"),
            url: SchemaIO.string({minLength: 1, maxLength: 2048}),
            title: SchemaIO.string({minLength: 1, maxLength: 70}),
          },
          {
            description: SchemaIO.string({minLength: 1, maxLength: 200}),
            thumbnail: SchemaIO.object(
              {image: BlobLink.io("image/jpeg")},
              {alt: SchemaIO.string({minLength: 1, maxLength: 125})}
            ),
          }
        ),
        IO.object({
          type: TagLink.io("images"),
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
      ]),
    }),
  ]),
  IO.exclusiveUnion([
    IO.partialObject({
      replyToPost: RecordLink.ioOf(
        "types.baq.dev",
        "9ff7bc7c66a04f3fb2c2078e7d696a46"
      ),
    }),
    IO.partialObject({
      quotePost: RecordLink.ioOf(
        "types.baq.dev",
        "9ff7bc7c66a04f3fb2c2078e7d696a46"
      ),
    }),
  ]),
]);

const [postRecordType, RPostRecordType] = RecordType.full(
  "types.baq.dev",
  "9ff7bc7c66a04f3fb2c2078e7d696a46",
  "2ea82c005797a255e064e0a6f10971b67fa529157e223b1c31f9bf0c6c806258",
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
