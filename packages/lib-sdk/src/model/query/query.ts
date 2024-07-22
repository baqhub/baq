import {JSONPath} from "jsonpath-plus";
import flow from "lodash/flow.js";
import isEqual from "lodash/isEqual.js";
import isString from "lodash/isString.js";
import orderBy from "lodash/orderBy.js";
import uniqBy from "lodash/uniqBy.js";
import {Constants} from "../../constants.js";
import {Array} from "../../helpers/array.js";
import {Str} from "../../helpers/string.js";
import {isDefined} from "../../helpers/type.js";
import {
  AnyRecord,
  NoContentRecord,
  RecordMode,
  RecordSource,
} from "../records/record.js";
import {RecordKey} from "../records/recordKey.js";
import {normalizePath} from "./pathHelpers.js";
import {QueryDate} from "./queryDate.js";
import {Q, QueryFilter} from "./queryFilter.js";
import {QuerySort, QuerySortDirection, QuerySortProperty} from "./querySort.js";

//
// Model.
//

type IncludeLink = "entity" | "existential" | string;
const includeLinkSpecialValues = ["entity", "existential"];
const defaultSources = [
  RecordSource.SELF,
  RecordSource.NOTIFICATION,
  RecordSource.SUBSCRIPTION,
];

interface StaticQueryBase {
  proxyTo?: string;
}

export interface LiveSingleQuery {
  sources?: ReadonlyArray<`${RecordSource}`>;
  includeLinks?: ReadonlyArray<IncludeLink>;
  includeDeleted?: boolean;
}

export interface SingleQuery extends LiveSingleQuery, StaticQueryBase {}

export interface LiveQuery<T extends AnyRecord> extends LiveSingleQuery {
  sort?: QuerySort;
  min?: QueryDate;
  max?: QueryDate;

  pageStart?: QueryDate;
  pageSize?: number;

  distinct?: string;
  filter?: QueryFilter<T>;
  mode?: `${RecordMode}`;
}

export interface Query<T extends AnyRecord>
  extends LiveQuery<T>,
    StaticQueryBase {}

const defaultSortBy: QuerySort = [
  QuerySortProperty.VERSION_RECEIVED_AT,
  QuerySortDirection.DESCENDING,
];

//
// I/O.
//

function buildQuery<T extends AnyRecord>(query: Query<T>) {
  return query;
}

function buildQueryFromKey<T extends AnyRecord>(
  key: RecordKey<T>,
  baseQuery: SingleQuery = {}
) {
  const {entity, recordId} = RecordKey.toComponents(key);

  return {
    ...baseQuery,
    pageSize: 1,
    filter: Q.and(Q.author(entity), Q.id(recordId)),
  } as Query<T>;
}

function singleQueryToQueryString(query: SingleQuery | undefined) {
  if (!query) {
    return "";
  }

  return paramsToString([
    ["include_links", includeLinksToString(query.includeLinks)],
    ["include_deleted", query.includeDeleted ? "true" : undefined],
    ["proxy_to", query.proxyTo],
  ]);
}

function queryToQueryString<T extends AnyRecord>(query: Query<T>) {
  const filterStrings = query.filter && QueryFilter.toListString(query.filter);

  return paramsToString([
    ["sort", query.sort && QuerySort.toString(query.sort)],
    ["min", query.min && QueryDate.toString(query.min)],
    ["max", query.max && QueryDate.toString(query.max)],
    ["page_start", query.pageStart && QueryDate.toString(query.pageStart)],
    ["page_size", (query.pageSize || Constants.defaultPageSize).toString()],
    ["distinct", query.distinct && normalizePath(query.distinct)],
    ...(filterStrings || []).map(f => ["filter", f] as const),
    ["include_links", includeLinksToString(query.includeLinks)],
    ["include_deleted", query.includeDeleted ? "true" : undefined],
    ["proxy_to", query.proxyTo],
  ]);
}

function includeLinksToString(
  includeLinks: ReadonlyArray<IncludeLink> | undefined
) {
  function includeLinkToString(link: IncludeLink) {
    if (includeLinkSpecialValues.includes(link)) {
      return link;
    }

    return normalizePath(link);
  }

  return includeLinks?.map(includeLinkToString).join(",");
}

function includeLinksIsSuperset(
  links1: ReadonlyArray<IncludeLink> | undefined,
  links2: ReadonlyArray<IncludeLink> | undefined
) {
  const defaultIncludeLinks = ["entity", "existential"];
  const l1 = links1 || defaultIncludeLinks;
  const l2 = links2 || defaultIncludeLinks;

  return l2.every(l => l1.includes(l));
}

function paramsToString(
  params: ReadonlyArray<readonly [string, string | undefined]>
) {
  const filteredParams = params
    .map(p => (isDefined(p[1]) ? ([p[0], p[1]] as const) : undefined))
    .filter(isDefined);

  return Str.query(filteredParams);
}

function findQueryMaxDate<T extends AnyRecord>(
  query: Query<T>,
  sortDirection: QuerySortDirection
) {
  if (query.pageStart && sortDirection === QuerySortDirection.DESCENDING) {
    return query.pageStart;
  }

  return query.max;
}

function findQueryMinDate<T extends AnyRecord>(
  query: Query<T>,
  sortDirection: QuerySortDirection
) {
  if (query.pageStart && sortDirection === QuerySortDirection.ASCENDING) {
    return query.pageStart;
  }

  return query.min;
}

function filterByQuery<R extends AnyRecord, T extends R>(
  records: ReadonlyArray<R | NoContentRecord>,
  query: Query<T>
) {
  const sortBy = query.sort || defaultSortBy;
  const sortDir = QuerySort.toDirection(sortBy);

  const maxDate = findQueryMaxDate(query, sortDir);
  const minDate = findQueryMinDate(query, sortDir);

  function sort() {
    const order = sortDir === QuerySortDirection.ASCENDING ? "asc" : "desc";
    return (list: ReadonlyArray<R | NoContentRecord>) => {
      return orderBy(list, r => QuerySort.findDateInRecord(r, sortBy), order);
    };
  }

  function filter() {
    function isMatch(record: R | NoContentRecord): record is T {
      if ("noContent" in record) {
        return false;
      }

      // Date boundaries.
      const recordDate = QuerySort.findDateInRecord(record, sortBy);
      const recordVersionHash = record.version?.hash;

      if (QueryDate.compare(recordDate, recordVersionHash, maxDate) > 0) {
        return false;
      }

      if (QueryDate.compare(recordDate, recordVersionHash, minDate) < 0) {
        return false;
      }

      if (query.mode && record.mode !== query.mode) {
        return false;
      }

      // Filter.
      return !query.filter || QueryFilter.isMatch(record, query.filter);
    }

    return (list: ReadonlyArray<R | NoContentRecord>) => {
      return list.filter(isMatch);
    };
  }

  function distinct() {
    const {distinct} = query;
    if (!distinct) {
      return (list: ReadonlyArray<T>) => list;
    }

    const distinctValue = (record: T) => {
      const recordValues: ReadonlyArray<any> = JSONPath({
        path: distinct,
        json: record,
      }).filter(isDefined);

      if (recordValues.length === 0) {
        return `null+${record.author.entity}+${record.id}`;
      }

      // TODO: Implement link detection for correct logic.
      const valueToString = (value: any) => {
        if (isString(value)) {
          return `"${value}"`;
        }

        if ("versionHash" in value) {
          return `${value.entity}+${value.recordId}+${value.versionHash}`;
        }

        if ("recordId" in value) {
          return `${value.entity}+${value.recordId}`;
        }

        if ("entity" in value) {
          return value.entity;
        }

        return String(value);
      };

      return recordValues.map(valueToString).join(":");
    };

    return (list: ReadonlyArray<T>) => uniqBy(list, distinctValue);
  }

  function pageSize() {
    return (list: ReadonlyArray<T>) => {
      return list.slice(0, query.pageSize || Constants.defaultPageSize);
    };
  }

  return flow(sort(), filter(), distinct(), pageSize())(records);
}

function queryIsMatch(query1: Query<AnyRecord>, query2: Query<AnyRecord>) {
  const {["filter"]: filter1, ...q1} = query1;
  const {["filter"]: filter2, ...q2} = query2;

  if (!isEqual(q1, q2)) {
    return false;
  }

  if (filter1 && filter2) {
    return (
      QueryFilter.isSuperset(filter1, filter2) &&
      QueryFilter.isSuperset(filter2, filter1)
    );
  }

  return !filter1 && !filter2;
}

function queryIsSuperset(query1: Query<AnyRecord>, query2: Query<AnyRecord>) {
  if (query1.distinct !== query2.distinct) {
    return false;
  }

  return queryIsSyncSuperset(query1, query2);
}

function queryIsSyncSuperset(
  query1: Query<AnyRecord>,
  query2: Query<AnyRecord>
) {
  if (
    query1.mode !== query2.mode ||
    query1.includeLinks !== query2.includeLinks ||
    query1.proxyTo !== query2.proxyTo
  ) {
    return false;
  }

  if (!includeLinksIsSuperset(query1.includeLinks, query2.includeLinks)) {
    return false;
  }

  const sources1 = query1.sources || defaultSources;
  const sources2 = query2.sources || defaultSources;

  if (!Array.isSuperset(sources1, sources2)) {
    return false;
  }

  if (query2.includeDeleted && !query1.includeDeleted) {
    return false;
  }

  if (query1.filter && query2.filter) {
    return QueryFilter.isSuperset(query1.filter, query2.filter);
  }

  return !query1.filter && !query2.filter;
}

export const Query = {
  new: buildQuery,
  ofKey: buildQueryFromKey,
  singleToQueryString: singleQueryToQueryString,
  toQueryString: queryToQueryString,
  filter: filterByQuery,
  isMatch: queryIsMatch,
  isSuperset: queryIsSuperset,
  isSyncSuperset: queryIsSyncSuperset,
};
