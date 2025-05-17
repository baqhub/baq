import {JSONPath} from "jsonpath-plus";
import compact from "lodash/compact.js";
import {never} from "../../helpers/customError.js";
import {unreachable} from "../../helpers/type.js";
import {AnyRecord, UnknownRecord} from "../records/record.js";
import {normalizePath, normalizeSnakePath} from "./pathHelpers.js";
import {QueryLinkValue} from "./queryLinkValue.js";

//
// Model.
//

export enum QueryLinkType {
  LINK = "link",
  PATH_LINK = "path_link",
  EMPTY_PATH_LINK = "empty_path_link",
}

type QueryLinkLink<T extends AnyRecord> = {
  type: QueryLinkType.LINK;
  value: QueryLinkValue<T>;
};

type QueryLinkPathLink<T extends AnyRecord> = {
  type: QueryLinkType.PATH_LINK;
  path: string;
  snakePath: string;
  value: QueryLinkValue<T>;
};

type QueryLinkEmptyPathLink = {
  type: QueryLinkType.EMPTY_PATH_LINK;
  path: string;
  snakePath: string;
};

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
  return {
    type: QueryLinkType.LINK,
    value,
  };
}

function buildPathLink<T extends AnyRecord = UnknownRecord>(
  path: string,
  value: QueryLinkValue<T>
): QueryLinkPathLink<T> {
  return {
    type: QueryLinkType.PATH_LINK,
    path: normalizePath(path),
    snakePath: normalizeSnakePath(path),
    value,
  };
}

function buildEmptyPathLink(path: string): QueryLinkEmptyPathLink {
  return {
    type: QueryLinkType.EMPTY_PATH_LINK,
    path: normalizePath(path),
    snakePath: normalizeSnakePath(path),
  };
}

const linkRegexp = /^(?:(\$[^=]+)=)?(.*)$/;

function queryLinkOfString(linkString: string): QueryLink<UnknownRecord> {
  const linkMatch = linkString.match(linkRegexp);
  if (!linkMatch || typeof linkMatch[2] !== "string") {
    return never();
  }

  const path = linkMatch[1];
  const valueString = linkMatch[2];

  // Empty path link.
  if (path && valueString === "") {
    return buildEmptyPathLink(path);
  }

  // Path link.
  const value = QueryLinkValue.ofString(valueString);
  if (path) {
    return buildPathLink(path, value);
  }

  // Link.
  return buildLink(value);
}

function queryLinkToString<T extends AnyRecord>(queryLink: QueryLink<T>) {
  switch (queryLink.type) {
    case QueryLinkType.LINK:
      return QueryLinkValue.toString(queryLink.value);

    case QueryLinkType.PATH_LINK: {
      const {snakePath} = queryLink;
      const valueString = QueryLinkValue.toString(queryLink.value);

      return `${snakePath}=${valueString}`;
    }

    case QueryLinkType.EMPTY_PATH_LINK:
      return `${queryLink.snakePath}=`;

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
  switch (queryLink.type) {
    case QueryLinkType.LINK:
      throw new Error("TODO: Implement local link detection.");

    case QueryLinkType.PATH_LINK:
      return recordHasLinkAtPath(queryLink.path, queryLink.value, record);

    case QueryLinkType.EMPTY_PATH_LINK:
      return recordHasEmptyPathLink(queryLink.path, record);

    default:
      unreachable(queryLink[0]);
  }
}

function queryLinkIsSuperset(
  link1: QueryLink<AnyRecord>,
  link2: QueryLink<AnyRecord>
) {
  switch (link1.type) {
    case QueryLinkType.LINK:
      return (
        (link2.type === QueryLinkType.LINK ||
          link2.type === QueryLinkType.PATH_LINK) &&
        QueryLinkValue.match(link1.value, link2.value)
      );

    case QueryLinkType.PATH_LINK:
      return (
        link2.type === QueryLinkType.PATH_LINK &&
        link1.path === link2.path &&
        QueryLinkValue.match(link1.value, link2.value)
      );

    case QueryLinkType.EMPTY_PATH_LINK:
      return (
        link2.type === QueryLinkType.EMPTY_PATH_LINK &&
        link1.path === link2.path
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
