import {Hash, isDefined, RecordPermissions} from "@baqhub/sdk";
import {BlobFromBuilder} from "@baqhub/server";
import {Note} from "@fedify/fedify";
import {Document} from "@fedify/fedify/vocab";
import {PostRecord, PostRecordContent} from "../baq/postRecord.js";
import {
  FetchImageEnv,
  postImageToBlobRequests,
} from "../services/imageFetcher.js";
import {
  FetchPreviewEnv,
  postLinkToPreview,
} from "../services/previewFetcher.js";
import {htmlToPostTextAndFacets} from "./string.js";

const imageMediaTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

type PostMedia = Extract<PostRecordContent, {media: any}>["media"];
type PostWebLink = Extract<PostMedia, {type: "web_link"}>;
type PostImage = Extract<PostMedia, {type: "images"}>["images"][0];

async function postRecordOfNote(
  env: FetchImageEnv & FetchPreviewEnv,
  blobFromRequest: BlobFromBuilder,
  entity: string,
  note: Note
): Promise<PostRecord | undefined> {
  const {id, published, contents} = note;
  const content = contents[0];

  if (!id || !published || !content) {
    return undefined;
  }

  const attachmentDocs = await Array.fromAsync(note.getAttachments());
  const attachmentPromises = attachmentDocs.map(
    async (doc, index): Promise<PostImage | undefined> => {
      if (!(doc instanceof Document)) {
        return undefined;
      }

      const {mediaType, width, height} = doc;
      if (
        !mediaType ||
        !imageMediaTypes.includes(mediaType) ||
        !width ||
        !height
      ) {
        return undefined;
      }

      const blobRequests = postImageToBlobRequests(env, doc, index);
      if (!blobRequests) {
        return undefined;
      }

      const [small, medium, large] = await Promise.all([
        blobFromRequest(blobRequests.small),
        blobFromRequest(blobRequests.medium),
        blobFromRequest(blobRequests.large),
      ]);
      if (!small || !medium || !large) {
        return undefined;
      }

      return {
        small: small.link,
        medium: medium.link,
        large: large.link,
        width,
        height,
      };
    }
  );

  const {text, textFacets} = htmlToPostTextAndFacets(content.toString());

  const webLinkPreviewPromise = (async (): Promise<PostWebLink | undefined> => {
    const firstLink = textFacets
      .map(l => (l.type === "web_link" ? l : undefined))
      .find(isDefined);
    if (!firstLink) {
      return undefined;
    }

    const preview = await postLinkToPreview(env, firstLink.url);
    if (!preview) {
      return undefined;
    }

    const thumbnail =
      preview.imageBlobRequest &&
      (await blobFromRequest(preview.imageBlobRequest));
    const thumbnailLink = thumbnail?.link;

    return {
      type: "web_link",
      url: firstLink.url,
      title: preview.title,
      description: preview.description,
      thumbnail: thumbnailLink && {image: thumbnailLink},
    };
  })();

  const [imagesMaybe, webLinkPreview] = await Promise.all([
    Promise.all(attachmentPromises),
    webLinkPreviewPromise,
  ]);

  const images = imagesMaybe.filter(isDefined);
  const media: PostMedia | undefined =
    images.length > 0 ? {type: "images", images} : webLinkPreview;

  return PostRecord.new(
    entity,
    {
      text,
      textFacets,
      media,
    },
    {
      id: Hash.shortHash(id.toString()),
      createdAt: new Date(published.epochMilliseconds),
      permissions: RecordPermissions.public,
    }
  );
}

export const PostRecordBuilder = {
  ofNote: postRecordOfNote,
};
