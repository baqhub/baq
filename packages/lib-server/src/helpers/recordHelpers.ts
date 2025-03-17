import {AnyBlobLink, AnyRecord} from "@baqhub/sdk";

export function findBlobLink(
  record: AnyRecord,
  hash: string,
  fileName: string
) {
  function findInUnknown(value: unknown): AnyBlobLink | undefined {
    if (!value || typeof value !== "object") {
      return undefined;
    }

    if (
      "hash" in value &&
      "type" in value &&
      "name" in value &&
      "size" in value &&
      value.hash === hash &&
      typeof value.type === "string" &&
      value.type &&
      typeof value.size === "number" &&
      value.name === fileName
    ) {
      return {
        hash: value.hash,
        type: value.type,
        size: value.size,
        name: value.name,
      };
    }

    for (const prop in value) {
      const result = findInUnknown((value as any)[prop]);
      if (result) {
        return result;
      }
    }

    return undefined;
  }

  return findInUnknown(record.content);
}
