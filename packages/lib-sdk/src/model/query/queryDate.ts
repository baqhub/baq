import isDate from "lodash/isDate.js";

//
// Model.
//

export type QueryDate = Date | [Date, string];

//
// I/O.
//

function queryDateToString(queryDate: QueryDate) {
  if (isDate(queryDate)) {
    return `"${queryDate.toISOString()}"`;
  }

  return `"${queryDate[0].toISOString()}"+${queryDate[1]}`;
}

function dateCompare(date1: Date, date2: Date) {
  if (date1 > date2) {
    return 1;
  }

  if (date1 < date2) {
    return -1;
  }

  return 0;
}

function stringCompare(string1: string, string2: string) {
  if (string1 === string2) {
    return 0;
  }

  if (string1 > string2) {
    return 1;
  }

  return -1;
}

function queryDateCompare(
  recordDate: Date | undefined,
  recordId: string | undefined,
  queryDate: QueryDate | undefined
) {
  if (!recordDate || !queryDate) {
    return 0;
  }

  // Only date.
  if (isDate(queryDate)) {
    return dateCompare(recordDate, queryDate);
  }

  // Date + VersionHash.
  const dateResult = dateCompare(recordDate, queryDate[0]);
  if (recordId && dateResult === 0) {
    return stringCompare(recordId, queryDate[1]);
  }

  return dateResult;
}

export const QueryDate = {
  toString: queryDateToString,
  compare: queryDateCompare,
};
