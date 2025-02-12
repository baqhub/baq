import {JSONPath} from "jsonpath-plus";
import compact from "lodash/compact.js";
import {never} from "../../helpers/customError.js";
import {unreachable} from "../../helpers/type.js";
import {AnyRecord, UnknownRecord} from "../records/record.js";
import {normalizePath} from "./pathHelpers.js";
import {QueryLinkValue} from "./queryLinkValue.js";

//
// Model.
//

export enum QueryLinkType {
  LINK = "link",
  PATH_LINK = "path_link",
  EMPTY_PATH_LINK = "empty_path_link",
}

type QueryLinkLink<T extends AnyRecord> = [
  QueryLinkType.LINK,
  QueryLinkValue<T>,
];
type QueryLinkPathLink<T extends AnyRecord> = [
  QueryLinkType.PATH_LINK,
  string,
  QueryLinkValue<T>,
];
type QueryLinkEmptyPathLink = [QueryLinkType.EMPTY_PATH_LINK, string];

export type QueryLink<T extends AnyRecord> =
  | QueryLinkLink<T>
  | QueryLinkPathLink<T>
  | QueryLinkEmptyPathLink;

//
// I/O.
//

function buildLink<T extends AnyRecord = UnknownRecord>(
  value: QueryLinkValue<T>
): QueryLinkLink<T> {
  return [QueryLinkType.LINK, value];
}

function buildPathLink<T extends AnyRecord = UnknownRecord>(
  path: string,
  value: QueryLinkValue<T>
): QueryLinkPathLink<T> {
  return [QueryLinkType.PATH_LINK, normalizePath(path), value];
}

function buildEmptyPathLink(path: string): QueryLinkEmptyPathLink {
  return [QueryLinkType.EMPTY_PATH_LINK, normalizePath(path)];
}

const linkRegexp = /^(?:(\$[^=]+)=)?(.*)$/;

export function queryLinkOfString(
  linkString: string
): QueryLink<UnknownRecord> {
  const linkMatch = linkString.match(linkRegexp);
  if (!linkMatch || typeof linkMatch[2] !== "string") {
    return never();
  }

  const path = linkMatch[1];
  const valueString = linkMatch[2];

  // Empty path link.
  if (path && valueString === "") {
    return [QueryLinkType.EMPTY_PATH_LINK, path];
  }

  // Path link.
  const value = QueryLinkValue.ofString(valueString);
  if (path) {
    return [QueryLinkType.PATH_LINK, path, value];
  }

  // Link.
  return [QueryLinkType.LINK, value];
}

function queryLinkToString<T extends AnyRecord>(queryLink: QueryLink<T>) {
  switch (queryLink[0]) {
    case QueryLinkType.LINK:
      return QueryLinkValue.toString(queryLink[1]);

    case QueryLinkType.PATH_LINK: {
      const path = queryLink[1];
      const valueString = QueryLinkValue.toString(queryLink[2]);

      return `${path}=${valueString}`;
    }

    case QueryLinkType.EMPTY_PATH_LINK:
      return `${normalizePath(queryLink[1])}=`;

    default:
      unreachable(queryLink[0]);
  }
}

// TODO: Implement link detection for accurate comparison.
function recordHasLinkAtPath<T extends AnyRecord>(
  path: string,
  value: QueryLinkValue<T>,
  record: T
) {
  const recordValues: ReadonlyArray<any> = JSONPath({path, json: record});
  return recordValues.some(v => QueryLinkValue.is(value, v));
}

// TODO: Implement link detection for accurate comparison.
function recordHasEmptyPathLink(path: string, record: AnyRecord) {
  const recordValues: ReadonlyArray<any> = JSONPath({path, json: record});
  return compact(recordValues).length === 0;
}

function linkIsInRecord<T extends AnyRecord>(
  record: T,
  queryLink: QueryLink<T>
) {
  switch (queryLink[0]) {
    case QueryLinkType.LINK:
      throw new Error("TODO: Implement local link detection.");

    case QueryLinkType.PATH_LINK:
      return recordHasLinkAtPath(queryLink[1], queryLink[2], record);

    case QueryLinkType.EMPTY_PATH_LINK:
      return recordHasEmptyPathLink(queryLink[1], record);

    default:
      unreachable(queryLink[0]);
  }
}

function queryLinkIsSuperset(
  link1: QueryLink<AnyRecord>,
  link2: QueryLink<AnyRecord>
) {
  switch (link1[0]) {
    case QueryLinkType.LINK:
      return (
        (link2[0] === QueryLinkType.LINK &&
          QueryLinkValue.match(link1[1], link2[1])) ||
        (link2[0] === QueryLinkType.PATH_LINK &&
          QueryLinkValue.match(link1[1], link2[2]))
      );

    case QueryLinkType.PATH_LINK:
      return (
        link2[0] === QueryLinkType.PATH_LINK &&
        link1[1] === link2[1] &&
        QueryLinkValue.match(link1[2], link2[2])
      );

    case QueryLinkType.EMPTY_PATH_LINK:
      return (
        link2[0] === QueryLinkType.EMPTY_PATH_LINK && link1[1] === link2[1]
      );

    default:
      unreachable(link1[0]);
  }
}

export const QueryLink = {
  link: buildLink,
  pathLink: buildPathLink,
  emptyPathLink: buildEmptyPathLink,
  ofString: queryLinkOfString,
  toString: queryLinkToString,
  isInRecord: linkIsInRecord,
  isSuperset: queryLinkIsSuperset,
};
