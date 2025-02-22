import {Constants} from "../../constants.js";
import * as IO from "../../helpers/io.js";
import {Signature} from "../../helpers/signature.js";
import {RecordLink} from "../links/recordLink.js";
import {Record} from "../records/record.js";
import {RecordType} from "../records/recordType.js";
import {AppRecord} from "./appRecord.js";

//
// Model.
//

export enum SignAlgorithm {
  ED25519 = "ed25519",
}

export const RSignAlgorithm = IO.weakEnumeration(SignAlgorithm);

const ServerCredentialsRecordContent = IO.object({
  app: RecordLink.io(AppRecord),
  algorithm: RSignAlgorithm,
  serverPublicKey: IO.union([IO.undefined, IO.string]),
  publicKey: IO.base64Bytes,
  privateKey: IO.base64Bytes,
});

const [serverCredentialsRecordType, RServerCredentialsRecordType] =
  RecordType.full(
    Constants.systemEntity,
    "2ba40fd9668f403da00b4a8070eb4a90",
    "67dd73c06877de2a810c2be7a55cc8ef579b9e3aa066d009489c57145c9eff2e",
    ServerCredentialsRecordContent
  );

const RServerCredentialsRecord = Record.io(
  serverCredentialsRecordType,
  RServerCredentialsRecordType,
  ServerCredentialsRecordContent
);

export interface ServerCredentialsRecord
  extends IO.TypeOf<typeof RServerCredentialsRecord> {}
export const ServerCredentialsRecord = Record.ioClean<ServerCredentialsRecord>(
  RServerCredentialsRecord
);

//
// I/O.
//

export function buildServerCredentialsRecord(app: AppRecord) {
  const [publicKey, privateKey] = Signature.buildKey();
  return ServerCredentialsRecord.new(app.author.entity, {
    app: Record.toLink(app),
    algorithm: SignAlgorithm.ED25519,
    serverPublicKey: undefined,
    publicKey: publicKey,
    privateKey: privateKey,
  });
}
