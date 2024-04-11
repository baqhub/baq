/* eslint-disable @typescript-eslint/no-unused-vars */
import {unreachable} from "../../helpers/type.js";
import {EntityLink} from "../links/entityLink.js";
import {AnyRecordLink} from "../links/recordLink.js";
import {VersionLink} from "../links/versionLink.js";
import {AnyRecord, UnknownRecord} from "../records/record.js";

//
// Model.
//

export enum QueryLinkValueType {
  TAG = "tag",
  ENTITY = "entity",
  RECORD = "record",
  VERSION = "version",
}

type QueryLinkValueTag = [QueryLinkValueType.TAG, string];
type QueryLinkValueEntity = [QueryLinkValueType.ENTITY, EntityLink];
type QueryLinkValueRecord<T extends AnyRecord> = [
  QueryLinkValueType.RECORD,
  AnyRecordLink,
  T,
];
type QueryLinkValueVersion = [QueryLinkValueType.VERSION, VersionLink];

export type QueryLinkValue<T extends AnyRecord> =
  | QueryLinkValueTag
  | QueryLinkValueEntity
  | QueryLinkValueRecord<T>
  | QueryLinkValueVersion;

//
// I/O.
//

function queryValueTag(tag: string): QueryLinkValueTag {
  return [QueryLinkValueType.TAG, tag];
}

function queryValueEntity(entity: string): QueryLinkValueEntity {
  return [QueryLinkValueType.ENTITY, {entity}];
}

function queryValueRecord<T extends AnyRecord = UnknownRecord>(
  recordLink: AnyRecordLink
): QueryLinkValueRecord<T> {
  return [QueryLinkValueType.RECORD, recordLink, undefined as any as T];
}

function queryValueVersion(versionLink: VersionLink): QueryLinkValueVersion {
  return [QueryLinkValueType.VERSION, versionLink];
}

function queryLinkValueToString<T extends AnyRecord>(
  queryLinkValue: QueryLinkValue<T>
) {
  switch (queryLinkValue[0]) {
    case QueryLinkValueType.TAG:
      return JSON.stringify(queryLinkValue[1]);

    case QueryLinkValueType.ENTITY:
      return queryLinkValue[1].entity;

    case QueryLinkValueType.RECORD: {
      const {entity, recordId} = queryLinkValue[1];
      return `${entity}+${recordId}`;
    }

    case QueryLinkValueType.VERSION: {
      const {entity, recordId, versionHash} = queryLinkValue[1];
      return `${entity}+${recordId}+${versionHash}`;
    }

    default:
      unreachable(queryLinkValue[0]);
  }
}

function queryLinkValueIs(value: QueryLinkValue<AnyRecord>, obj: any) {
  switch (value[0]) {
    case QueryLinkValueType.TAG:
      return value[1] === obj;

    case QueryLinkValueType.ENTITY: {
      return obj?.entity === value[1].entity;
    }

    case QueryLinkValueType.RECORD: {
      return (
        obj?.entity === value[1].entity && obj?.recordId === value[1].recordId
      );
    }

    case QueryLinkValueType.VERSION: {
      return (
        obj?.entity === value[1].entity &&
        obj?.recordId === value[1].recordId &&
        obj?.versionHash === value[1].versionHash
      );
    }

    default:
      unreachable(value[0]);
  }
}

function queryLinkValuesMatch(
  value1: QueryLinkValue<AnyRecord>,
  value2: QueryLinkValue<AnyRecord>
) {
  switch (value1[0]) {
    case QueryLinkValueType.TAG:
      return value2[0] === QueryLinkValueType.TAG && value1[1] === value2[1];

    case QueryLinkValueType.ENTITY:
      return (
        value2[0] === QueryLinkValueType.ENTITY &&
        value1[1].entity === value2[1].entity
      );

    case QueryLinkValueType.RECORD:
      return (
        value2[0] === QueryLinkValueType.RECORD &&
        value1[1].entity === value2[1].entity &&
        value1[1].recordId === value2[1].recordId
      );

    case QueryLinkValueType.VERSION:
      return (
        value2[0] === QueryLinkValueType.VERSION &&
        value1[1].entity === value2[1].entity &&
        value1[1].recordId === value2[1].recordId &&
        value1[1].versionHash === value2[1].versionHash
      );

    default:
      unreachable(value1[0]);
  }
}

export const QueryLinkValue = {
  tag: queryValueTag,
  entity: queryValueEntity,
  record: queryValueRecord,
  version: queryValueVersion,
  is: queryLinkValueIs,
  match: queryLinkValuesMatch,
  toString: queryLinkValueToString,
};
