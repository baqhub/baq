import {AnyRecord, Query} from "@baqhub/sdk";

export interface StoreQuery<T extends AnyRecord, Q extends T> {
  id: number;
  query: Query<Q>;
  promise: Promise<void> | undefined;
  isSync: boolean;
  isComplete: boolean;
  isDisplayed: boolean;
  recordVersions: ReadonlyArray<string> | undefined;
}

export type LiveQueryMode = "local" | "local-tracked" | "fetch" | "sync";

export interface LiveQueryOptions {
  mode?: LiveQueryMode;
}
