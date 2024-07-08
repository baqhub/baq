import * as IO from "../../helpers/io.js";
import {AppRecord} from "../recordTypes/appRecord.js";
import {EntityRecord} from "../recordTypes/entityRecord.js";
import {ServerCredentialsRecord} from "../recordTypes/serverCredentialsRecord.js";

//
// Model.
//

const RAuthenticationStateRaw = IO.object({
  entityRecord: EntityRecord,
  appRecord: AppRecord,
  credentialsRecord: ServerCredentialsRecord,
  serverPublicKey: IO.union([IO.undefined, IO.base64Bytes]),
  authorizationId: IO.union([IO.undefined, IO.string]),
});

export interface AuthenticationState
  extends IO.TypeOf<typeof RAuthenticationStateRaw> {}
export const RAuthenticationState = IO.clean<AuthenticationState>(
  RAuthenticationStateRaw
);

//
// I/O.
//

export const AuthenticationState = {
  decode: (value: unknown) => {
    return IO.decode(RAuthenticationState, value);
  },
  decodeJSON: (value: string) => {
    return AuthenticationState.decode(JSON.parse(value));
  },
  encode: (state: AuthenticationState) => {
    return IO.encode(RAuthenticationState, state);
  },
  encodeJSON: (state: AuthenticationState) => {
    return JSON.stringify(AuthenticationState.encode(state));
  },
};
