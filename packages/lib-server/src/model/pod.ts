import {IO, RSignAlgorithm} from "@baqhub/sdk";

export const PodKeyPair = IO.object({
  algorithm: RSignAlgorithm,
  publicKey: IO.base64Bytes,
  privateKey: IO.base64Bytes,
});

export const Pod = IO.object({
  id: IO.string,
  entity: IO.string,
  keyPairs: IO.readonlyArray(PodKeyPair),
  context: IO.unknown,
  createdAt: IO.isoDate,
  updatedAt: IO.isoDate,
});

export interface Pod extends IO.TypeOf<typeof Pod> {}
