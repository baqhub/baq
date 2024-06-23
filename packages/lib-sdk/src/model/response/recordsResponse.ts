import * as IO from "../../helpers/io.js";
import {RAnyRecord} from "../records/record.js";

//
// Model.
//

export function recordsResponse<K extends RAnyRecord, T extends RAnyRecord>(
  knownRecord: K,
  recordType: T
) {
  return IO.dualObject(
    {
      pageSize: IO.number,
      records: IO.arrayIgnore(recordType),
      linkedRecords: IO.arrayIgnore(knownRecord),
    },
    {
      nextPage: IO.string,
    }
  );
}
