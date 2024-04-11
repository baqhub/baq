import * as IO from "../../helpers/io.js";

//
// Model.
//

export enum CredentialsAlgorithm {
  ED_25519 = "ed25519",
}

export const RCredentialsAlgorithm = IO.weakEnumeration(CredentialsAlgorithm);
