import {AnyRecord, NoContentRecord, RecordId} from "./record.js";

export type RecordKey<T extends AnyRecord | NoContentRecord> = string & {
  _type?: T;
};

function tryParseKey(key: string) {
  const separatorIndex = key.lastIndexOf("+");
  if (separatorIndex < 0) {
    return undefined;
  }

  const entity = key.slice(0, separatorIndex);
  const recordId = key.slice(separatorIndex + 1);
  return {entity, recordId};
}

function keyToComponents<T extends AnyRecord>(key: RecordKey<T>) {
  const separatorIndex = key.lastIndexOf("+");
  const entity = key.slice(0, separatorIndex);
  const recordId = key.slice(separatorIndex + 1) as RecordId<T>;
  return {entity, recordId};
}

export const RecordKey = {
  tryParse: tryParseKey,
  toComponents: keyToComponents,
};
