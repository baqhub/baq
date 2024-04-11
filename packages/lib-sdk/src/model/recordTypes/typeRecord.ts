import * as IO from "../../helpers/io.js";
import {RSchema} from "../core/schema.js";
import {RecordLink} from "../links/recordLink.js";
import {Record, VersionHash} from "../records/record.js";
import {RecordKey} from "../records/recordKey.js";
import {RecordType} from "../records/recordType.js";

//
// Model.
//

export const TypeRecordContent = IO.intersection([
  IO.object({
    name: IO.string,
    schema: RSchema,
    uniqueBy: IO.union([
      IO.undefined,
      IO.object({
        domain: IO.union([IO.undefined, IO.string]),
        values: IO.readonlyArray(IO.string),
      }),
    ]),
  }),
  IO.partialObject({
    iconName: IO.string,
  }),
]);

const [typeRecordType, RTypeRecordType] = RecordType.full(
  "schemas.baq.dev",
  "ba132234fc384e7b8d61bcd049e9f84f",
  "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824",
  TypeRecordContent
);

const RTypeRecord = Record.io(
  typeRecordType,
  RTypeRecordType,
  TypeRecordContent
);

export interface TypeRecordContent
  extends IO.TypeOf<typeof TypeRecordContent> {}
export interface TypeRecord extends IO.TypeOf<typeof RTypeRecord> {}
export const TypeRecord = Record.ioClean<TypeRecord>(RTypeRecord);

export type TypeRecordLink = RecordLink<TypeRecord>;
export type TypeRecordKey = RecordKey<TypeRecord>;
export type TypeVersionHash = VersionHash<TypeRecord>;
