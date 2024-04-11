import * as IO from "../../helpers/io.js";

//
// Model.
//

const RBlobResponseRaw = IO.object({
  hash: IO.string,
  size: IO.Int,
  expiresAt: IO.isoDate,
});

export interface BlobResponse extends IO.TypeOf<typeof RBlobResponseRaw> {}
export const RBlobResponse = IO.clean<BlobResponse>(RBlobResponseRaw);
