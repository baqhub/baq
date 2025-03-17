import {IO, RSignAlgorithm, Signature} from "@baqhub/sdk";

//
// Model.
//

export const RPodKeyPair = IO.object({
  algorithm: RSignAlgorithm,
  publicKey: IO.base64Bytes,
  privateKey: IO.base64Bytes,
});

export const RPod = IO.object({
  id: IO.string,
  entity: IO.string,
  keyPairs: IO.readonlyArray(RPodKeyPair),
  context: IO.unknown,
  createdAt: IO.isoDate,
  updatedAt: IO.isoDate,
});

export interface PodKeyPair extends IO.TypeOf<typeof RPodKeyPair> {}
export interface Pod extends IO.TypeOf<typeof RPod> {}

//
// API.
//

function signVersionHash(pod: Pod, versionHash: string) {
  const firstKeyPair = pod.keyPairs[0];
  if (!firstKeyPair) {
    throw new Error("No keypair found in pod.");
  }

  const versionHashBytes = IO.decode(IO.utf8Bytes, versionHash);
  return Signature.sign(firstKeyPair.privateKey, versionHashBytes);
}

//
// Exports.
//

export const Pod = {
  io: RPod,
  signVersionHash,
};
