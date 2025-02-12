import {unreachable} from "../../helpers/type.js";
import {AnyRecordLink} from "../links/recordLink.js";
import {VersionLink} from "../links/versionLink.js";
import {AnyRecord, CleanRecordType, UnknownRecord} from "../records/record.js";
import {QueryLink} from "./queryLink.js";
import {QueryLinkValue} from "./queryLinkValue.js";

//
// Model.
//

export enum QueryFilterType {
  LINK = "link",
  AND = "and",
  OR = "or",
}

export type QueryFilterLink<T extends AnyRecord> = [
  QueryFilterType.LINK,
  QueryLink<T>,
];
type QueryFilterAnd<T extends AnyRecord> = [
  QueryFilterType.AND,
  ReadonlyArray<QueryFilter<T>>,
];
export type QueryFilterOr<T extends AnyRecord> = [
  QueryFilterType.OR,
  ReadonlyArray<QueryFilter<T>>,
];

export type QueryFilter<T extends AnyRecord> =
  | QueryFilterLink<T>
  | QueryFilterAnd<T>
  | QueryFilterOr<T>;

//
// I/O.
//

function queryLink<T extends AnyRecord = UnknownRecord>(
  link: QueryLink<T>
): QueryFilterLink<T> {
  return [QueryFilterType.LINK, link];
}

function queryAnd<T extends ReadonlyArray<QueryFilter<AnyRecord>>>(
  ...filters: T
): T extends ReadonlyArray<QueryFilter<infer R>> ? QueryFilterAnd<R> : never {
  return [QueryFilterType.AND, filters] as any;
}

function queryOr<T extends ReadonlyArray<QueryFilter<AnyRecord>>>(
  ...filters: T
): T extends ReadonlyArray<QueryFilter<infer R>> ? QueryFilterOr<R> : never {
  return [QueryFilterType.OR, filters] as any;
}

const nextTokenRegexp = /^((?:\()|(?:\))|(?:[^,()]*)),{0,1}(.*)/;
type IntermediateResult = [ReadonlyArray<QueryFilter<AnyRecord>>, string];

function queryFilterOfString(filterString: string): QueryFilter<AnyRecord> {
  function parseQueryFilters(
    fragment: string,
    depth: number
  ): IntermediateResult {
    const tokenMatch = fragment.match(nextTokenRegexp);
    if (
      !tokenMatch ||
      typeof tokenMatch[1] !== "string" ||
      typeof tokenMatch[2] !== "string"
    ) {
      throw new Error("Bad filter.");
    }

    const token = tokenMatch[1];
    const rest = tokenMatch[2];

    function handleGroup(startRest: string): IntermediateResult {
      const [groupFilters, groupRest] = parseQueryFilters(startRest, depth + 1);
      const [filters, rest] = parseQueryFilters(groupRest, depth);

      if (depth > 10) {
        throw new Error(`Filter is too deep: ${filterString}`);
      } else if (depth % 2) {
        // Odd depth.
        return [[queryOr(...groupFilters), ...filters], rest];
      } else {
        // Even depth.
        return [[queryAnd(...groupFilters), ...filters], rest];
      }
    }

    function handleLink(
      linkString: string,
      linkRest: string
    ): IntermediateResult {
      const link = QueryLink.ofString(linkString);
      const [filters, rest] = parseQueryFilters(linkRest, depth);
      return [[queryLink(link), ...filters], rest];
    }

    // End of string.
    if (token === "" && rest === "") {
      return [[], ""];
    }

    // Start of group.
    if (token === "(") {
      return handleGroup(rest);
    }

    // End of group.
    if (token === ")") {
      return [[], rest];
    }

    return handleLink(token, rest);
  }

  const [filters] = parseQueryFilters(filterString, 1);

  // Single filter: unwrap.
  if (filters.length === 1 && filters[0]) {
    return filters[0];
  }

  // Otherwise, combine with AND.
  return queryAnd(...filters);
}

export function queryFilterOfStrings(
  filterStrings: ReadonlyArray<string>
): QueryFilter<AnyRecord> {
  const orFilters = filterStrings.map(queryFilterOfString);

  // Single filter: unwrap.
  if (orFilters.length === 1 && orFilters[0]) {
    return orFilters[0];
  }

  // Otherwise: combine with OR.
  return queryOr(...orFilters);
}

function queryFilterToString<T extends AnyRecord>(filter: QueryFilter<T>) {
  function toStringWithDepth(filter: QueryFilter<T>, depth: number): string {
    function filtersToString(filters: ReadonlyArray<QueryFilter<T>>) {
      return filters.map(f => toStringWithDepth(f, depth + 1)).join(",");
    }

    function singleFilterInType(
      type: QueryFilterType.AND | QueryFilterType.OR,
      filters: ReadonlyArray<QueryFilter<T>>
    ) {
      const onlyFilter = filters[0];
      if (!onlyFilter || filters.length !== 1) {
        return undefined;
      }

      if (onlyFilter[0] !== type) {
        return undefined;
      }

      const nestedFilters = onlyFilter[1];
      const onlyNestedFilter = nestedFilters[0];
      if (!onlyNestedFilter || nestedFilters.length !== 1) {
        return undefined;
      }

      return onlyNestedFilter;
    }

    function orAndToString(
      type: QueryFilterType,
      filters: ReadonlyArray<QueryFilter<T>>
    ) {
      // Edge-cases.
      if (type === QueryFilterType.AND && depth === 0) {
        return filtersToString(filters);
      }

      const orSingleFilter = singleFilterInType(QueryFilterType.OR, filters);
      if (type === QueryFilterType.AND && orSingleFilter) {
        return toStringWithDepth(orSingleFilter, depth);
      }

      const andSingleFilter = singleFilterInType(QueryFilterType.AND, filters);
      if (type === QueryFilterType.OR && andSingleFilter) {
        return toStringWithDepth(andSingleFilter, depth);
      }

      // General case.
      return `(${filtersToString(filters)})`;
    }

    switch (filter[0]) {
      case QueryFilterType.LINK:
        return QueryLink.toString(filter[1]);

      case QueryFilterType.AND:
      case QueryFilterType.OR:
        return orAndToString(filter[0], filter[1]);

      default:
        unreachable(filter[0]);
    }
  }

  return toStringWithDepth(filter, 0);
}

function queryFilterToListString<T extends AnyRecord>(
  queryFilter: QueryFilter<T>
) {
  // Unwrap the top-level OR if present.
  if (queryFilter[0] === QueryFilterType.OR) {
    return queryFilter[1].map(queryFilterToString);
  }

  // Otherwise, simply wrap in a list.
  return [queryFilterToString(queryFilter)];
}

function queryFilterIsMatch<R extends AnyRecord, T extends R>(
  record: R,
  queryFilter: QueryFilter<T>
): record is T {
  switch (queryFilter[0]) {
    case QueryFilterType.LINK:
      return QueryLink.isInRecord(record, queryFilter[1]);

    case QueryFilterType.AND:
      return queryFilter[1].every(f => queryFilterIsMatch(record, f));

    case QueryFilterType.OR:
      return queryFilter[1].some(f => queryFilterIsMatch(record, f));

    default:
      unreachable(queryFilter[0]);
  }
}

type FlatQueryFilterItem = QueryFilterLink<AnyRecord>;
type FlatQueryFilter = FlatQueryFilterItem[][];

function flattenQueryFilter(filter: QueryFilter<AnyRecord>): FlatQueryFilter {
  switch (filter[0]) {
    case QueryFilterType.LINK:
      return [[filter]];

    case QueryFilterType.AND:
      return filter[1].reduce((result, filter) => {
        const flattened = flattenQueryFilter(filter);

        if (result.length === 0) {
          return flattened;
        }

        if (flattened.length === 0) {
          return result;
        }

        return result.reduce((r1, f1) => {
          return flattened.reduce((r2, f2) => {
            r2.push([...f1, ...f2]);
            return r2;
          }, r1);
        }, [] as FlatQueryFilter);
      }, [] as FlatQueryFilter);

    case QueryFilterType.OR:
      return filter[1].flatMap(flattenQueryFilter);

    default:
      unreachable(filter[0]);
  }
}

function flatQueryFilterItemIsSuperset(
  item1: FlatQueryFilterItem,
  item2: FlatQueryFilterItem
) {
  return (
    item2[0] === QueryFilterType.LINK &&
    QueryLink.isSuperset(item1[1], item2[1])
  );
}

function flatQueryFilterIsSuperset(
  filter1: FlatQueryFilter,
  filter2: FlatQueryFilter
) {
  function subFilterIsSuperset(
    subFilter1: FlatQueryFilterItem[],
    subFilter2: FlatQueryFilterItem[]
  ) {
    return subFilter1.every(f1 => {
      return subFilter2.some(f2 => flatQueryFilterItemIsSuperset(f1, f2));
    });
  }

  if (filter1.length === 0) {
    return true;
  }

  if (filter2.length === 0) {
    return false;
  }

  return filter2.every(sf2 => {
    return filter1.some(sf1 => subFilterIsSuperset(sf1, sf2));
  });
}

function queryFilterIsSuperset(
  filter1: QueryFilter<AnyRecord>,
  filter2: QueryFilter<AnyRecord>
) {
  const flatFilter1 = flattenQueryFilter(filter1);
  const flatFilter2 = flattenQueryFilter(filter2);

  return flatQueryFilterIsSuperset(flatFilter1, flatFilter2);
}

//
// Query builders.
//

function queryTag(path: string, tag: string) {
  return QueryFilter.link(QueryLink.pathLink(path, QueryLinkValue.tag(tag)));
}

function queryBlob(path: string, hash: string) {
  return QueryFilter.link(QueryLink.pathLink(path, QueryLinkValue.blob(hash)));
}

function queryEntity(path: string, entity: string) {
  return QueryFilter.link(
    QueryLink.pathLink(path, QueryLinkValue.entity(entity))
  );
}

function queryRecord(path: string, recordLink: AnyRecordLink) {
  return QueryFilter.link(
    QueryLink.pathLink(path, QueryLinkValue.record(recordLink))
  );
}

function queryVersion(path: string, versionLink: VersionLink) {
  return QueryFilter.link(
    QueryLink.pathLink(path, QueryLinkValue.version(versionLink))
  );
}

function queryId(id: string) {
  return QueryFilter.link(QueryLink.pathLink("id", QueryLinkValue.tag(id)));
}

function queryAuthor(entity: string) {
  return queryEntity("author", entity);
}

function queryType<T extends AnyRecord>(type: CleanRecordType<T>) {
  return QueryFilter.link(
    QueryLink.pathLink(
      "type",
      QueryLinkValue.record<T>({
        entity: type.type.entity,
        recordId: type.type.recordId,
      })
    )
  );
}

function queryEmpty(path: string) {
  return QueryFilter.link(QueryLink.emptyPathLink(path));
}

export const QueryFilter = {
  link: queryLink,
  and: queryAnd,
  or: queryOr,
  tag: queryTag,
  blob: queryBlob,
  entity: queryEntity,
  record: queryRecord,
  version: queryVersion,
  id: queryId,
  author: queryAuthor,
  type: queryType,
  empty: queryEmpty,
  ofString: queryFilterOfString,
  ofStrings: queryFilterOfStrings,
  toString: queryFilterToString,
  toListString: queryFilterToListString,
  isMatch: queryFilterIsMatch,
  isSuperset: queryFilterIsSuperset,
};

export const Q = QueryFilter;
