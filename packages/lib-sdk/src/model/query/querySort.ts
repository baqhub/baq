import {JSONPath} from "jsonpath-plus";
import {AnyRecord, NoContentRecord} from "../records/record.js";
import {normalizeSnakePath} from "./pathHelpers.js";

//
// Model.
//

export enum QuerySortProperty {
  CREATED_AT = "createdAt",
  RECEIVED_AT = "receivedAt",
  VERSION_CREATED_AT = "version.createdAt",
  VERSION_RECEIVED_AT = "version.receivedAt",
}

export enum QuerySortDirection {
  ASCENDING = "ascending",
  DESCENDING = "descending",
}

export type QuerySort = [
  `${QuerySortProperty}` | (string & NonNullable<unknown>),
  `${QuerySortDirection}`,
];

//
// I/O.
//

const querySortDirectionMap: {[K in `${QuerySortDirection}`]: string} = {
  [QuerySortDirection.ASCENDING]: "asc",
  [QuerySortDirection.DESCENDING]: "desc",
};

const querySortDefault: QuerySort = [
  QuerySortProperty.VERSION_RECEIVED_AT,
  QuerySortDirection.DESCENDING,
];

const querySortSyncDefault: QuerySort = [
  QuerySortProperty.VERSION_RECEIVED_AT,
  QuerySortDirection.ASCENDING,
];

function querySortToString(querySort: QuerySort) {
  const property = normalizeSnakePath(querySort[0]);
  const direction = querySortDirectionMap[querySort[1]];

  return `${property}+${direction}`;
}

function querySortToDirection(querySort: QuerySort) {
  return querySort[1] as QuerySortDirection;
}

function findDateInRecord(
  record: AnyRecord | NoContentRecord,
  querySort: QuerySort
) {
  switch (querySort[0]) {
    case QuerySortProperty.CREATED_AT:
      return record.createdAt;

    case QuerySortProperty.RECEIVED_AT:
      return record.receivedAt;

    case QuerySortProperty.VERSION_CREATED_AT:
      return record.version?.createdAt;

    case QuerySortProperty.VERSION_RECEIVED_AT:
      return record.version?.receivedAt;

    default: {
      const recordValues: ReadonlyArray<any> = JSONPath({
        path: querySort[0],
        json: record,
      });
      return recordValues[0];
    }
  }
}

export const QuerySort = {
  default: querySortDefault,
  syncDefault: querySortSyncDefault,
  toString: querySortToString,
  toDirection: querySortToDirection,
  findDateInRecord,
};
