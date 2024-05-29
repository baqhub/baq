import {
  AnyBlobLink,
  AnyRecord,
  BlobResponse,
  Client,
  Handler,
  NoContentRecord,
  Query,
  RecordKey,
} from "@baqhub/sdk";
import {createContext, useContext} from "react";
import {StoreQuery} from "./storeQuery.js";

export type RecordVersions<T extends AnyRecord> = {
  [K: string]: T | NoContentRecord;
};

export type Records<T extends AnyRecord> = {
  [K: RecordKey<T>]: T | NoContentRecord;
};
export interface RecordsState<T extends AnyRecord> {
  dictionary: Records<T>;
  list: ReadonlyArray<T | NoContentRecord>;
}

export interface EntityRecordsState<T extends AnyRecord> {
  [K: string]: RecordsState<T>;
}

export type Queries<T extends AnyRecord> = {[K: number]: StoreQuery<T, T>};
export type LiveQueries<T extends AnyRecord> = ReadonlyArray<StoreQuery<T, T>>;

export type Subscription = () => void;

export type Selector<T extends AnyRecord, R> = (
  state: EntityRecordsState<T>
) => R;

export interface RegisterQueryOptions {
  isFetch: boolean;
  isSync: boolean;
  isLocalTracked: boolean;
}

export interface StoreContextProps<T extends AnyRecord> {
  entity: string;
  client: Client;
  versions: RecordVersions<T>;
  updateRecords: (u: ReadonlyArray<T | NoContentRecord>, e?: string) => void;
  buildBlobUrl: <R extends T>(
    record: R,
    blob: AnyBlobLink,
    expiresInSeconds?: number
  ) => string;
  uploadBlob: (blob: Blob, signal?: AbortSignal) => Promise<BlobResponse>;
  onDisconnectRequest: Handler;
  // Internal.
  subscribeToState: (callback: () => void) => () => void;
  getStateSnapshot: () => EntityRecordsState<T>;
  subscribeToQueries: (callback: () => void) => () => void;
  getQueriesSnapshot: () => Queries<T>;
  subscribeToLiveQueries: (callback: () => void) => () => void;
  getLiveQueriesSnapshot: () => LiveQueries<T>;
  registerQuery: <Q extends T>(
    query: Query<Q>,
    options: RegisterQueryOptions
  ) => StoreQuery<T, Q>;
  registerLiveQuery: (query: StoreQuery<T, T>) => (() => void) | undefined;
}

export function buildStoreContext<T extends AnyRecord>() {
  const StoreContext = createContext<StoreContextProps<T> | undefined>(
    undefined
  );

  function useStoreContext() {
    const storeContext = useContext(StoreContext);
    if (!storeContext) {
      throw new Error("Store provider is required.");
    }

    return storeContext;
  }

  return {
    StoreContext,
    useStoreContext,
  };
}
