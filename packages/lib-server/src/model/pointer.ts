import {IO} from "@baqhub/sdk";

//
// Model.
//

export enum PointerType {
  ENTITY = "ENTITY",
  RECORD = "RECORD",
  VERSION = "VERSION",
}

const REntityPointer = IO.object({
  type: IO.literal(PointerType.ENTITY),
  podId: IO.string,
});

const RRecordPointer = IO.object({
  type: IO.literal(PointerType.RECORD),
  podId: IO.string,
  recordId: IO.string,
});

const RVersionPointer = IO.object({
  type: IO.literal(PointerType.VERSION),
  podId: IO.string,
  recordId: IO.string,
  versionHash: IO.string,
});

const RPointer = IO.union([REntityPointer, RRecordPointer, RVersionPointer]);

//
// Exports.
//

export type Pointer = IO.TypeOf<typeof RPointer>;

export const Pointer = {
  io: RPointer,
};
