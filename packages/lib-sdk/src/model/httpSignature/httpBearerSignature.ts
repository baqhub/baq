import {base64Bytes, decode, utf8Bytes} from "../../helpers/io.js";
import {Signature} from "../../helpers/signature.js";
import {Str} from "../../helpers/string.js";
import {
  CredentialsAlgorithm,
  RCredentialsAlgorithm,
} from "../core/credentialsAlgorithm.js";
import {HttpMethod} from "../core/httpMethod.js";
import {HttpSignatureInput} from "./httpSignatureInput.js";

//
// Model.
//

export interface HttpBearerSignature {
  id: string;
  timestamp: number;
  algorithm: `${CredentialsAlgorithm}`;
  signature: Uint8Array;
}

//
// I/O.
//

function signatureToQuery(signature: HttpBearerSignature) {
  const values = [
    signature.id,
    signature.timestamp,
    base64Bytes.encode(signature.signature),
  ];
  return Str.toUrlBase64(values.join("\\"));
}

//
// Sign.
//

export function signatureForRequest(
  appRecordId: string,
  privateKey: Uint8Array,
  input: HttpSignatureInput,
  timestamp: number
): HttpBearerSignature {
  const algorithm = CredentialsAlgorithm.ED_25519;

  const signatureString = [
    "baq.url",
    RCredentialsAlgorithm.encode(algorithm),
    timestamp,
    "",
    input.authorizationId || "",
    HttpMethod.GET,
    input.pathAndQuery,
    input.host,
    input.port,
    "",
  ].join("\n");

  const signatureBytes = Signature.sign(
    privateKey,
    decode(utf8Bytes, signatureString)
  );

  return {
    id: appRecordId,
    timestamp,
    algorithm,
    signature: signatureBytes,
  };
}

export const HttpBearerSignature = {
  request: signatureForRequest,
  toQuery: signatureToQuery,
};
