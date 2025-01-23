import {IO} from "@baqhub/sdk";

const RCachedBlob = IO.object({
  id: IO.string,
  hash: IO.string,
  size: IO.number,
  firstFileName: IO.string,
  firstType: IO.string,
  createdAt: IO.isoDate,
  context: IO.unknown,
});

export interface CachedBlob extends IO.TypeOf<typeof RCachedBlob> {}

export const CachedBlob = {
  io: RCachedBlob,
};
