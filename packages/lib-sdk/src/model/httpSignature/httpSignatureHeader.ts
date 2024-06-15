import {Constants} from "../../constants.js";
import * as IO from "../../helpers/io.js";

const {
  clientIdHeader,
  contentSha256Header,
  publicKeyHeader,
  lastEventIdHeader,
} = Constants;

//
// Model.
//

export enum HttpSignatureHeader {
  RANGE = "RANGE",
  CLIENT_ID = "CLIENT_ID",
  CONTENT_SHA_256 = "CONTENT_SHA_256",
  PUBLIC_KEY = "PUBLIC_KEY",
  LAST_EVENT_ID = "LAST_EVENT_ID",
}

export const RHttpSignatureHeader = IO.weakEnumerationWithValues(
  HttpSignatureHeader,
  {
    [HttpSignatureHeader.RANGE]: "range",
    [HttpSignatureHeader.CLIENT_ID]: clientIdHeader.toLowerCase(),
    [HttpSignatureHeader.CONTENT_SHA_256]: contentSha256Header.toLowerCase(),
    [HttpSignatureHeader.PUBLIC_KEY]: publicKeyHeader.toLowerCase(),
    [HttpSignatureHeader.LAST_EVENT_ID]: lastEventIdHeader.toLowerCase(),
  },
  {isCaseSensitive: false}
);
