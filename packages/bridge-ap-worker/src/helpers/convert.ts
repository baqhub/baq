import {Hash, RecordPermissions} from "@baqhub/sdk";
import {Note} from "@fedify/fedify";
import {stripHtml} from "string-strip-html";
import {PostRecord} from "../baq/postRecord";

export function noteToPostRecord(
  entity: string,
  note: Note
): PostRecord | undefined {
  const {id, published, contents} = note;
  const content = contents[0];

  if (!id || !published || !content) {
    return undefined;
  }

  return PostRecord.new(
    entity,
    {
      text: stripHtml(content.toString()).result.slice(0, 499),
    },
    {
      id: Hash.shortHash(id.toString()),
      createdAt: new Date(published.epochMilliseconds),
      permissions: RecordPermissions.public,
    }
  );
}
