import * as IO from "../../helpers/io.js";
import {RAnyRecord} from "../records/record.js";

//
// Model.
//

function recordResponse<K extends RAnyRecord, T extends IO.Any>(
  knownRecord: K,
  recordType: T
) {
  return IO.object({
    record: recordType,
    linkedRecords: IO.readonlyArray(knownRecord),
  });
}

export const RecordResponse = {
  io: recordResponse,
};
