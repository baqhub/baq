import {IO, Uuid} from "@baqhub/sdk";

//
// Model.
//

const RBlobUpload = IO.object({
  id: IO.string,
  hash: IO.union([IO.string, IO.undefined]),
  createdAt: IO.isoDate,
  updatedAt: IO.isoDate,
});

export interface BlobUpload extends IO.TypeOf<typeof RBlobUpload> {}

//
// API.
//

function build(): BlobUpload {
  return {
    id: Uuid.new(),
    hash: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function withHash(blobUpload: BlobUpload, hash: string): BlobUpload {
  return {
    ...blobUpload,
    hash,
    updatedAt: new Date(),
  };
}

export const BlobUpload = {
  io: RBlobUpload,
  new: build,
  withHash,
};
