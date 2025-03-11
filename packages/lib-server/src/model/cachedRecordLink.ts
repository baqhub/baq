import {IO} from "@baqhub/sdk";
import {Pointer} from "./pointer.js";

//
// Model.
//

const RCachedRecordLink = IO.object({
  path: IO.string,
  pointer: Pointer.io,
});

//
// Exports.
//

export interface CachedRecordLink extends IO.TypeOf<typeof RCachedRecordLink> {}

export const CachedRecordLink = {
  io: RCachedRecordLink,
};
