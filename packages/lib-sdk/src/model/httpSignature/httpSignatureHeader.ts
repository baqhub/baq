import {Constants} from "../../constants.js";
import * as IO from "../../helpers/io.js";

const {
  clientIdHeader,
  contentSha256Header,
  credentialsHeader,
  lastEventIdHeader,
} = Constants;

//
// Model.
//

export enum HttpSignatureHeader {
  RANGE = "RANGE",
  CLIENT_ID = "CLIENT_ID",
  CONTENT_SHA_256 = "CONTENT_SHA_256",
  CREDENTIALS = "CREDENTIALS",
  LAST_EVENT_ID = "LAST_EVENT_ID",
}

export const RHttpSignatureHeader = IO.weakEnumerationWithValues(
  HttpSignatureHeader,
  {
    [HttpSignatureHeader.RANGE]: "range",
    [HttpSignatureHeader.CLIENT_ID]: clientIdHeader.toLowerCase(),
    [HttpSignatureHeader.CONTENT_SHA_256]: contentSha256Header.toLowerCase(),
    [HttpSignatureHeader.CREDENTIALS]: credentialsHeader.toLowerCase(),
    [HttpSignatureHeader.LAST_EVENT_ID]: lastEventIdHeader.toLowerCase(),
  },
  {isCaseSensitive: false}
);
