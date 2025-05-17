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
  UnknownRecord,
} from "../records/record.js";
import {RecordKey} from "../records/recordKey.js";
import {normalizeSnakePath} from "./pathHelpers.js";
import {QueryDate} from "./queryDate.js";
import {Q, QueryFilter} from "./queryFilter.js";
import {QuerySort, QuerySortDirection, QuerySortProperty} from "./querySort.js";

//
// Model.
//

type IncludeLink =
  | "entity"
  | "standing"
  | "existential"
  | (string & NonNullable<unknown>);

const includeLinkSpecialValues: ReadonlyArray<IncludeLink> = [
  "entity",
  "standing",
  "existential",
];

const defaultIncludeLinks: ReadonlyArray<IncludeLink> = [
  "entity",
  "existential",
];

const defaultSources: ReadonlyArray<RecordSource> = [
  RecordSource.SELF,
  RecordSource.NOTIFICATION,
  RecordSource.SUBSCRIPTION,
];

interface StaticQueryBase {
  proxyTo?: string;
}

export interface LiveSingleQuery {
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
  sources?: ReadonlyArray<`${RecordSource}`>;
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

function queryNew<T extends AnyRecord>(query: Query<T>) {
  return query;
}

function queryOfKey<T extends AnyRecord>(
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

type Params = Record<string, string[]>;
type Parser<T> = (value: string) => T | undefined;

function readSingle<T>(
  params: Params,
  key: string,
  parser: Parser<T>
): T | undefined {
  const values = params[key];
  if (!values) {
    return undefined;
  }

  const first = values[0];
  if (typeof first === "undefined") {
    return undefined;
  }

  return parser(first);
}

function readInt(params: Params, key: string) {
  const parser = (value: string) => {
    const num = Number(value);
    return Number.isSafeInteger(num) ? num : undefined;
  };

  return readSingle(params, key, parser);
}

function readBoolean(params: Params, key: string) {
  const parser = (value: string) => {
    return value.toLowerCase() === "true";
  };

  return readSingle(params, key, parser);
}

function queryOfQueryParams(queryParams: Params): Query<UnknownRecord> {
  const pageSize = readInt(queryParams, "page_size");
  const filterStrings = queryParams["filter"];

  return {
    pageSize: Number.isSafeInteger(pageSize)
      ? pageSize
      : Constants.defaultPageSize,
    includeDeleted: readBoolean(queryParams, "include_deleted"),
    filter: filterStrings && QueryFilter.ofStrings(filterStrings),
  };
}

function queryOfQueryString(queryString: string): Query<UnknownRecord> {
  const params = Str.parseQuery(queryString).reduce((state, [key, value]) => {
    const values = state[key] || (state[key] = []);
    values.push(value);
    return state;
  }, {} as Params);

  return queryOfQueryParams(params);
}

function querySingleToQueryString(query: SingleQuery | undefined) {
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
    ["distinct", query.distinct && normalizeSnakePath(query.distinct)],
    ["sources", query.sources?.join(",")],
    ...(filterStrings || []).map(f => ["filter", f] as const),
    ["include_links", includeLinksToString(query.includeLinks)],
    ["include_deleted", query.includeDeleted ? "true" : undefined],
    ["proxy_to", query.proxyTo],
  ]);
}

function queryToSync<T extends AnyRecord>(
  query: Query<T>,
  boundary: QueryDate
): Query<T> {
  return {
    max: undefined,
    min: boundary,
    sort: QuerySort.syncDefault,
    pageStart: undefined,
    pageSize: 100,
    distinct: undefined,
    sources: query.sources,
    filter: query.filter,
    mode: query.mode,
    includeLinks: query.includeLinks,
    includeDeleted: true,
    proxyTo: query.proxyTo,
  };
}

function queryFindBoundary<T extends AnyRecord>(
  query: Query<T>,
  record: T
): QueryDate {
  const sort = query.sort || QuerySort.default;
  return [QuerySort.findDateInRecord(record, sort), record.id];
}

function includeLinksToString(
  includeLinks: ReadonlyArray<IncludeLink> | undefined
) {
  function includeLinkToString(link: IncludeLink) {
    if (includeLinkSpecialValues.includes(link)) {
      return link;
    }

    return normalizeSnakePath(link);
  }

  return includeLinks?.map(includeLinkToString).join(",");
}

function includeLinksIsSuperset(
  links1: ReadonlyArray<IncludeLink> | undefined,
  links2: ReadonlyArray<IncludeLink> | undefined
) {
  const l1 = links1 || defaultIncludeLinks;
  const l2 = links2 || defaultIncludeLinks;

  return Array.isSuperset(l1, l2);
}

function sourcesIsSuperset(
  sources1: ReadonlyArray<`${RecordSource}`> | undefined,
  sources2: ReadonlyArray<`${RecordSource}`> | undefined
) {
  const s1 = sources1 || defaultSources;
  const s2 = sources2 || defaultSources;

  return Array.isSuperset(s1, s2);
}

function paramsToString(
  params: ReadonlyArray<readonly [string, string | undefined]>
) {
  const filteredParams = params
    .map(p => (isDefined(p[1]) ? ([p[0], p[1]] as const) : undefined))
    .filter(isDefined);

  return Str.buildQuery(filteredParams);
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

interface QueryFilterOptions {
  ignorePageSize?: boolean;
  boundary?: QueryDate;
}

function queryFilter<R extends AnyRecord, T extends R>(
  query: Query<T>,
  records: ReadonlyArray<R | NoContentRecord>,
  {ignorePageSize, boundary}: QueryFilterOptions = {}
) {
  const sortBy = query.sort || defaultSortBy;
  const sortDir = QuerySort.toDirection(sortBy);
  const isAscending = sortDir === QuerySortDirection.ASCENDING;

  const maxDate = findQueryMaxDate(query, sortDir);
  const minDate = findQueryMinDate(query, sortDir);

  function sort() {
    const order = isAscending ? "asc" : "desc";
    return (list: ReadonlyArray<R | NoContentRecord>) => {
      return orderBy(list, r => QuerySort.findDateInRecord(r, sortBy), order);
    };
  }

  function distinct() {
    const {distinct} = query;
    if (!distinct) {
      return (list: ReadonlyArray<R | NoContentRecord>) => list;
    }

    const distinctValue = (record: R | NoContentRecord) => {
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

    return (list: ReadonlyArray<R | NoContentRecord>) =>
      uniqBy(list, distinctValue);
  }

  function filter() {
    function isMatch(record: R | NoContentRecord): record is T {
      // Exclude deleted.
      if ("noContent" in record) {
        return false;
      }

      // Date boundaries.
      const recordDate = QuerySort.findDateInRecord(record, sortBy);
      const recordId = record.id;

      if (QueryDate.compare(recordDate, recordId, maxDate) > 0) {
        return false;
      }

      if (QueryDate.compare(recordDate, recordId, minDate) < 0) {
        return false;
      }

      if (boundary) {
        const result = QueryDate.compare(recordDate, recordId, boundary);
        if (isAscending ? result > 0 : result < 0) {
          return false;
        }
      }

      if (query.mode && record.mode !== query.mode) {
        return false;
      }

      // Sources.
      const sources = query.sources || defaultSources;
      if (
        !sources.includes(record.source) &&
        record.source !== RecordSource.PROXY
      ) {
        return false;
      }

      // Filter.
      return !query.filter || QueryFilter.isMatch(record, query.filter);
    }

    return (list: ReadonlyArray<R | NoContentRecord>) => {
      return list.filter(isMatch);
    };
  }

  function pageSize(): (list: ReadonlyArray<T>) => ReadonlyArray<T> {
    if (ignorePageSize) {
      return list => list;
    }

    return list => {
      return list.slice(0, query.pageSize || Constants.defaultPageSize);
    };
  }

  return flow(sort(), distinct(), filter(), pageSize())(records);
}

function queryIsSyncSuperset(
  query1: Query<AnyRecord>,
  query2: Query<AnyRecord>
) {
  if (query1.mode !== query2.mode || query1.proxyTo !== query2.proxyTo) {
    return false;
  }

  if (!includeLinksIsSuperset(query1.includeLinks, query2.includeLinks)) {
    return false;
  }

  if (!sourcesIsSuperset(query1.sources, query2.sources)) {
    return false;
  }

  if (query2.includeDeleted && !query1.includeDeleted) {
    return false;
  }

  if (query1.filter && query2.filter) {
    return QueryFilter.isSuperset(query1.filter, query2.filter);
  }

  return !query1.filter;
}

function queryIsSuperset(query1: Query<AnyRecord>, query2: Query<AnyRecord>) {
  if (query1.distinct !== query2.distinct) {
    return false;
  }

  return queryIsSyncSuperset(query1, query2);
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

export const Query = {
  new: queryNew,
  ofKey: queryOfKey,
  ofQueryParams: queryOfQueryParams,
  ofQueryString: queryOfQueryString,
  singleToQueryString: querySingleToQueryString,
  toQueryString: queryToQueryString,
  toSync: queryToSync,
  findBoundary: queryFindBoundary,
  filter: queryFilter,
  isSyncSuperset: queryIsSyncSuperset,
  isSuperset: queryIsSuperset,
  isMatch: queryIsMatch,
  defaultIncludeLinks,
  defaultSources,
};
