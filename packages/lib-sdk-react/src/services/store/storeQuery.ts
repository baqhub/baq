import {AnyRecord, Query, QueryDate} from "@baqhub/sdk";

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

export type LiveQueryMode = "local" | "local-tracked" | "fetch" | "sync";

export interface LiveQueryOptions {
  mode?: LiveQueryMode;
  loadMorePageSize?: number;
}

interface NoRefreshStaticQueryOptions {
  refreshMode?: never;
  refreshInterval?: never;
  loadMorePageSize?: number;
}

interface SyncRefreshStaticQueryOptions {
  refreshMode: "sync";
  refreshInterval: number;
  loadMorePageSize?: number;
}

interface FullRefreshStaticQueryOptions {
  refreshMode: "full";
  refreshInterval: number;
  loadMorePageSize?: never;
}

export type StaticQueryOptions =
  | NoRefreshStaticQueryOptions
  | SyncRefreshStaticQueryOptions
  | FullRefreshStaticQueryOptions;
