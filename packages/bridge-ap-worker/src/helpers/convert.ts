import {Hash, isDefined, RecordPermissions} from "@baqhub/sdk";
import {BlobFromBuilder} from "@baqhub/server";
import {Note} from "@fedify/fedify";
import {Document} from "@fedify/fedify/vocab";
import {stripHtml} from "string-strip-html";
import {PostRecord, PostRecordContent} from "../baq/postRecord.js";
import {postImageToBlobRequests} from "../services/blobFetcher.js";

const imageMediaTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function noteToPostRecord(
  env: Env,
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
    async (
      doc,
      index
    ): Promise<
      undefined | Extract<PostRecordContent, {images: any}>["images"][0]
    > => {
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
        size: large.size,
      };
    }
  );

  const attachments = await Promise.all(attachmentPromises);
  const images = attachments.filter(isDefined);

  return PostRecord.new(
    entity,
    {
      text: stripHtml(content.toString()).result.slice(0, 499),
      images,
    },
    {
      id: Hash.shortHash(id.toString()),
      createdAt: new Date(published.epochMilliseconds),
      permissions: RecordPermissions.public,
    }
  );
}
