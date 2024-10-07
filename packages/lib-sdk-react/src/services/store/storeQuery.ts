import {AnyRecord, Query, QueryDate} from "@baqhub/sdk";

//
// StoreQuery.
//

type RefreshMode = "sync" | "full";

export interface QueryRefreshSpec {
  mode: RefreshMode;
  interval: number;
}

export interface StoreQuery<T extends AnyRecord, Q extends T> {
  id: number;
  query: Query<Q>;
  promise: Promise<void> | undefined;
  error: unknown | undefined;
  refreshSpec: QueryRefreshSpec | undefined;
  refreshCount: number;
  refreshBoundary: QueryDate | undefined;
  refresh: (refreshCount: number) => void;
  loadMorePromise: Promise<void> | undefined;
  loadMoreError: unknown | undefined;
  loadMoreQuery: string | undefined;
  loadMore: (() => void) | undefined;
  isSync: boolean;
  isComplete: boolean;
  isDisplayed: boolean;
  loadedBoundary: QueryDate | undefined;
  recordVersions: ReadonlyArray<string> | undefined;
}

//
// UseQuery.
//

export type LiveQueryMode = "local" | "local-tracked" | "fetch" | "sync";

export interface UseRecordsQueryOptions {
  mode?: LiveQueryMode;
  loadMorePageSize?: number;
}

export interface UseRecordQueryOptions {
  mode?: LiveQueryMode;
}

//
// UseStaticQuery.
//

interface NoRefreshUseStaticRecordsQueryOptions {
  refreshMode?: "none";
  refreshIntervalSeconds?: never;
  loadMorePageSize?: number;
}

interface SyncRefreshUseStaticRecordsQueryOptions {
  refreshMode: "sync";
  refreshIntervalSeconds: number;
  loadMorePageSize?: number;
}

interface FullRefreshUseStaticRecordsQueryOptions {
  refreshMode: "full";
  refreshIntervalSeconds: number;
  loadMorePageSize?: never;
}

export type UseStaticRecordsQueryOptions =
  | NoRefreshUseStaticRecordsQueryOptions
  | SyncRefreshUseStaticRecordsQueryOptions
  | FullRefreshUseStaticRecordsQueryOptions;

export interface UseStaticRecordQueryOptions {
  refreshIntervalSeconds?: number;
}

export function staticRecordQueryOptionsToRefreshSpec(
  options: UseStaticRecordsQueryOptions
): QueryRefreshSpec | undefined {
  if (!options.refreshMode || options.refreshMode === "none") {
    return undefined;
  }

  return {
    mode: options.refreshMode,
    interval: (options.refreshIntervalSeconds || 30) * 1000, // Default: 30s.
  };
}
