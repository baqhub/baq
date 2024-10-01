import {AnyRecord, Query} from "@baqhub/sdk";

export interface StoreQuery<T extends AnyRecord, Q extends T> {
  id: number;
  query: Query<Q>;
  promise: Promise<void> | undefined;
  refresh: (refreshCount: number) => void;
  refreshCount: number;
  refreshInterval: number | undefined;
  isSync: boolean;
  isComplete: boolean;
  isDisplayed: boolean;
  error: unknown | undefined;
  recordVersions: ReadonlyArray<string> | undefined;
}

export type LiveQueryMode = "local" | "local-tracked" | "fetch" | "sync";

export interface LiveQueryOptions {
  mode?: LiveQueryMode;
}

export interface StaticQueryOptions {
  refreshInterval?: number;
}
