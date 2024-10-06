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
  refreshMode?: never;
  refreshInterval?: never;
  loadMorePageSize?: number;
}

interface SyncRefreshUseStaticRecordsQueryOptions {
  refreshMode: "sync";
  refreshInterval: number;
  loadMorePageSize?: number;
}

interface FullRefreshUseStaticRecordsQueryOptions {
  refreshMode: "full";
  refreshInterval: number;
  loadMorePageSize?: never;
}

export type UseStaticRecordsQueryOptions =
  | NoRefreshUseStaticRecordsQueryOptions
  | SyncRefreshUseStaticRecordsQueryOptions
  | FullRefreshUseStaticRecordsQueryOptions;

interface SyncRefreshUseStaticRecordQueryOptions {
  refreshMode: "sync";
  refreshInterval: number;
}

interface FullRefreshUseStaticRecordQueryOptions {
  refreshMode: "full";
  refreshInterval: number;
}

export type UseStaticRecordQueryOptions =
  | Record<string, never>
  | SyncRefreshUseStaticRecordQueryOptions
  | FullRefreshUseStaticRecordQueryOptions;
