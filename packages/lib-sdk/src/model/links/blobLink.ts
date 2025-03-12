import * as IO from "../../helpers/io.js";
import {BlobResponse} from "../response/blobResponse.js";

//
// Model.
//

export interface BlobLink<T extends string> {
  hash: string;
  type: T;
  size: number;
  name: string;
}

export type AnyBlobLink = BlobLink<any>;

//
// Runtime model.
//

export class BlobLinkClass<
  V extends string,
  T extends IO.LiteralC<V> | IO.StringC,
> extends IO.Type<BlobLink<IO.TypeOf<T>>, unknown, unknown> {
  constructor(type: T) {
    const model = IO.object({
      hash: IO.string,
      type: type,
      size: IO.number,
      name: IO.string,
    });

    super("BlobLink", model.is, model.validate, model.encode);
  }
}

function blobLink<T extends string>(type: T) {
  return new BlobLinkClass<T, IO.LiteralType<T>>(IO.literal(type));
}

const RAnyBlobLink = new BlobLinkClass(IO.string);

//
// I/O.
//

function buildBlobLink<T extends string>(
  blobResponse: BlobResponse,
  type: T,
  name: string
): BlobLink<T> {
  return {
    hash: blobResponse.hash,
    size: blobResponse.size,
    type,
    name,
  };
}

//
// Exports.
//

export const BlobLink = {
  io: blobLink,
  new: buildBlobLink,
};

export const AnyBlobLink = {
  io: () => RAnyBlobLink,
};
