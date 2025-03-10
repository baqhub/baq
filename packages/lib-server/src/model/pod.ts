import {IO, RSignAlgorithm} from "@baqhub/sdk";

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

export const Pod = {
  io: RPod,
};
