import {IO} from "@baqhub/sdk";

const RCachedBlob = IO.object({
  id: IO.string,
  hash: IO.string,
  size: IO.number,
  firstFileName: IO.string,
  firstType: IO.string,
  context: IO.unknown,
  createdAt: IO.isoDate,
});

export interface CachedBlob extends IO.TypeOf<typeof RCachedBlob> {}

export const CachedBlob = {
  io: RCachedBlob,
};
