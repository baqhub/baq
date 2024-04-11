/* eslint-disable @typescript-eslint/no-unused-vars */
import * as IO from "../../helpers/io.js";

//
// Model.
//

export interface RecordType<_T, _C, E extends string, R extends string> {
  entity: E;
  recordId: R;
  versionHash: string;
}

export type AnyRecordType = RecordType<any, any, any, any>;

//
// Runtime model.
//

export type RRecordType<T, C, E extends string, R extends string> = IO.Type<
  RecordType<T, C, E, R>
>;

export type RAnyRecordType = RRecordType<any, any, any, any>;

function buildRecordType<E extends string, R extends string>(
  entity: E,
  recordId: R,
  versionHash: string
) {
  const RType: RRecordType<any, any, E, R> = IO.object({
    entity: IO.literal(entity),
    recordId: IO.literal(recordId),
    versionHash: IO.string,
  });

  function typeCreator<C extends IO.Any>(
    _content: C
  ): RecordType<IO.TypeOf<typeof RType>, IO.TypeOf<C>, E, R> {
    return {
      entity,
      recordId,
      versionHash,
    };
  }

  return [RType, typeCreator] as const;
}

function buildRecordTypeFull<
  E extends string,
  R extends string,
  C extends IO.Any,
>(entity: E, recordId: R, versionHash: string, _content: C) {
  const type: RecordType<IO.TypeOf<typeof RType>, IO.TypeOf<C>, E, R> = {
    entity,
    recordId,
    versionHash,
  };

  const RType: RRecordType<any, any, E, R> = IO.object({
    entity: IO.literal(entity),
    recordId: IO.literal(recordId),
    versionHash: IO.string,
  });

  return [type, RType] as const;
}

function typeToKey(type: AnyRecordType) {
  return `${type.entity}+${type.recordId}`;
}

export const RecordType = {
  new: buildRecordType,
  full: buildRecordTypeFull,
  toKey: typeToKey,
};
