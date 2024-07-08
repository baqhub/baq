import * as IO from "../../helpers/io.js";
import {ServerCredentialsRecord} from "../recordTypes/serverCredentialsRecord.js";
import {RCredentialsAlgorithm} from "./credentialsAlgorithm.js";
import {HttpHeader} from "./httpHeader.js";

//
// Model.
//

const RHttpCredentialsHeader = IO.object({
  algorithm: RCredentialsAlgorithm,
  publicKey: IO.base64Bytes,
});

export interface HttpCredentialsHeader
  extends IO.TypeOf<typeof RHttpCredentialsHeader> {}

//
// I/O.
//

function buildFromCredentialsRecord(
  record: ServerCredentialsRecord
): HttpCredentialsHeader {
  return {
    algorithm: record.content.algorithm,
    publicKey: record.content.publicKey,
  };
}

function tryParseCredentialsHeader(value: string | null) {
  if (!value) {
    return undefined;
  }

  const parameters = HttpHeader.parse(value);
  return IO.tryDecode(RHttpCredentialsHeader, parameters);
}

function credentialsToString(credentials: HttpCredentialsHeader) {
  return HttpHeader.toString(IO.encode(RHttpCredentialsHeader, credentials));
}

export const HttpCredentialsHeader = {
  ofRecord: buildFromCredentialsRecord,
  tryParseHeader: tryParseCredentialsHeader,
  toString: credentialsToString,
};
