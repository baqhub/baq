import {Canonicalization} from "../../helpers/canonicalization.js";
import {Hash} from "../../helpers/hash.js";
import * as IO from "../../helpers/io.js";
import {AnyRecord, NoContentRecord} from "./record.js";

function canonicalize(
  object: unknown,
  level: number,
  propertyName?: string | number
): unknown {
  // Primitive type.
  if (object === null || typeof object !== "object") {
    return object;
  }

  // Array.
  if (Array.isArray(object)) {
    return object.map(o => canonicalize(o, level + 1));
  }

  const mapProperties = (keys: ReadonlyArray<string | number>) => {
    return Object.fromEntries(
      keys.map(k => [k, canonicalize((object as any)[k], level + 1, k)])
    );
  };

  // Top level object: record.
  if (level === 0) {
    return mapProperties([
      "author",
      "id",
      "created_at",
      "version",
      "permissions",
      "type",
      "content",
      "no_content",
    ]);
  }

  // 2nd level object: version.
  if (level === 1 && propertyName === "version") {
    return mapProperties(["author", "created_at", "parent_hash"]);
  }

  // Link.
  if ("original_entity" in object && "entity" in object) {
    return {
      ...mapProperties(Object.keys(object)),
      original_entity: undefined,
      entity: object.original_entity,
    };
  }

  return mapProperties(Object.keys(object));
}

function ofRecord<K extends AnyRecord | NoContentRecord>(
  model: IO.Type<K, any, any>,
  record: K
) {
  const encodedRecord = model.encode(record);
  const canonicalRecord = canonicalize(encodedRecord, 0);
  const canonicalRecordJson = Canonicalization.canonicalize(canonicalRecord);
  return Hash.hash(canonicalRecordJson);
}

export const RecordVersionHash = {
  ofRecord,
};
