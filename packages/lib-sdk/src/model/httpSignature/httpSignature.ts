import {Constants} from "../../constants.js";
import * as IO from "../../helpers/io.js";
import {sign} from "../../helpers/signature.js";
import {Str} from "../../helpers/string.js";
import {
  CredentialsAlgorithm,
  RCredentialsAlgorithm,
} from "../core/credentialsAlgorithm.js";
import {
  HttpSignatureHeader,
  RHttpSignatureHeader,
} from "./httpSignatureHeader.js";
import {HttpSignatureInput} from "./httpSignatureInput.js";

//
// Model.
//

enum HttpSignaturePrefix {
  REQUEST = "baq.request",
  RESPONSE = "baq.response",
}

const RHttpSignaturePrefix = IO.weakEnumeration(HttpSignaturePrefix);

export interface HttpSignature {
  id: string;
  timestamp: number;
  nonce: string;
  headers: ReadonlyArray<`${HttpSignatureHeader}`>;
  algorithm: CredentialsAlgorithm;
  signature: Uint8Array;
}

//
// I/O.
//

function signatureToHeader(signature: HttpSignature) {
  const pairs: ReadonlyArray<[string, string]> = [
    ["id", signature.id],
    ["ts", signature.timestamp.toString()],
    ["nonce", signature.nonce],
    ["headers", signature.headers.map(RHttpSignatureHeader.encode).join(",")],
    ["algorithm", RCredentialsAlgorithm.encode(signature.algorithm)],
    ["signature", IO.base64Bytes.encode(signature.signature)],
  ];

  const pairsString = pairs.map(([k, v]) => `${k}="${v}"`).join(" ");
  return `${Constants.httpSignaturePrefix} ${pairsString}`;
}

//
// Sign and Validate.
//

function buildSignatureString(
  prefix: HttpSignaturePrefix,
  signature: HttpSignature,
  input: HttpSignatureInput
) {
  const prefixString = RHttpSignaturePrefix.encode(prefix);
  const algorithmString = RCredentialsAlgorithm.encode(signature.algorithm);

  const headersString = signature.headers
    .map(header => {
      const headerKey = RHttpSignatureHeader.encode(header);
      const headerValue = input.headerValues.get(header) || "";

      return `${headerKey}=${headerValue}\n`;
    })
    .join("");

  return [
    prefixString,
    algorithmString,
    signature.timestamp,
    signature.nonce,
    input.authorizationId || "",
    input.method,
    input.pathAndQuery,
    input.host,
    input.port,
    headersString,
  ].join("\n");
}

function httpSign(
  prefix: HttpSignaturePrefix,
  appRecordId: string,
  privateKey: Uint8Array,
  input: HttpSignatureInput
): HttpSignature {
  const initialSignature: HttpSignature = {
    id: appRecordId,
    timestamp: Date.now(),
    nonce: Str.random(8),
    headers: [...input.headerValues.keys()],
    algorithm: CredentialsAlgorithm.ED_25519,
    signature: new Uint8Array(0),
  };

  const signatureString = buildSignatureString(prefix, initialSignature, input);
  const signatureBytes = sign(
    privateKey,
    IO.decode(IO.utf8Bytes, signatureString)
  );

  return {
    ...initialSignature,
    signature: signatureBytes,
  };
}

function signatureForRequest(
  appRecordId: string,
  privateKey: Uint8Array,
  input: HttpSignatureInput
) {
  return httpSign(HttpSignaturePrefix.REQUEST, appRecordId, privateKey, input);
}

function signatureForResponse(
  appRecordId: string,
  privateKey: Uint8Array,
  input: HttpSignatureInput
) {
  return httpSign(HttpSignaturePrefix.RESPONSE, appRecordId, privateKey, input);
}

export const HttpSignature = {
  request: signatureForRequest,
  response: signatureForResponse,
  toHeader: signatureToHeader,
};
