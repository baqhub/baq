import reduce from "lodash/reduce.js";
import {tryDecode} from "../../helpers/io.js";
import {HttpHeaders} from "../core/httpHeaders.js";
import {HttpMethod} from "../core/httpMethod.js";
import {
  HttpSignatureHeader,
  RHttpSignatureHeader,
} from "./httpSignatureHeader.js";

//
// Model.
//

export interface HttpSignatureInput {
  authorizationId: string | undefined;
  method: string;
  pathAndQuery: string;
  host: string;
  port: number;
  headerValues: Map<`${HttpSignatureHeader}`, string>;
}

//
// Helpers.
//

function signatureInputFromRequest(
  method: HttpMethod,
  url: string,
  headers: HttpHeaders,
  authorizationId: string | undefined
): HttpSignatureInput {
  const headerValues = reduce(
    headers,
    (result, value, header) => {
      const signatureHeader = tryDecode(RHttpSignatureHeader, header);
      if (!signatureHeader) {
        return result;
      }

      result.set(signatureHeader, value);
      return result;
    },
    new Map<`${HttpSignatureHeader}`, string>()
  );

  const urlObj = new URL(url);
  return {
    authorizationId,
    method,
    pathAndQuery: urlObj.pathname + urlObj.search,
    host: urlObj.hostname,
    port: Number(urlObj.port) || 443,
    headerValues,
  };
}

export const HttpSignatureInput = {
  new: signatureInputFromRequest,
};
