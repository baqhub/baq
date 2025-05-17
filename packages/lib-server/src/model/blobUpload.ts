import {IO, Uuid} from "@baqhub/sdk";

//
// Model.
//

const RBlobUpload = IO.object({
  id: IO.string,
  createdAt: IO.isoDate,
});

export interface BlobUpload extends IO.TypeOf<typeof RBlobUpload> {}

//
// API.
//

function build(): BlobUpload {
  return {
    id: Uuid.new(),
    createdAt: new Date(),
  };
}

export const BlobUpload = {
  io: RBlobUpload,
  new: build,
};
