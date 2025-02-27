import * as IO from "../../helpers/io.js";
import {
  AnyEventRecord,
  AnyRecord,
  RAnyEventRecord,
  RAnyRecord,
} from "../records/record.js";

//
// Model.
//

function recordResponse<K extends RAnyRecord, T extends RAnyEventRecord>(
  knownRecord: K,
  recordType: T
) {
  return IO.object({
    record: recordType,
    linkedRecords: IO.readonlyArray(knownRecord),
  });
}

export interface RecordResponse<K extends AnyRecord, T extends AnyEventRecord> {
  record: T;
  linkedRecords: ReadonlyArray<K>;
}

export const RecordResponse = {
  io: recordResponse,
};
