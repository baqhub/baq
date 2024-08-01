import {
  AbortedError,
  AnyBlobLink,
  AnyRecord,
  Async,
  BlobUrlBuilder,
  CleanRecordType,
  Client,
  EntityRecord,
  Handler,
  Http,
  HttpStatusCode,
  IO,
  LiveQuery,
  NoContentRecord,
  Query,
  RNoContentRecord,
  Record,
  RecordKey,
  RecordSource,
  StandingDecision,
  StandingRecord,
  SubscriptionRecord,
  VersionHash,
  isDefined,
  isPromise,
} from "@baqhub/sdk";
import memoize from "lodash/memoize.js";
import orderBy from "lodash/orderBy.js";
import uniqBy from "lodash/uniqBy.js";
import {
  FC,
  PropsWithChildren,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import {useSyncExternalStoreWithSelector} from "use-sync-external-store/with-selector.js";
import {isReferenceEqual, isShallowEqual} from "../../helpers/equality.js";
import {useDeepMemo, useIsMounted, useStable} from "../../helpers/hooks.js";
import {
  ProxyStoreContextProps,
  buildAccessors,
  buildHelpers,
  buildProxyStoreContext,
} from "./proxyStore.js";
import {
  EntityRecordsState,
  LiveQueries,
  Queries,
  RecordVersions,
  Records,
  RegisterQueryOptions,
  Selector,
  StoreContextProps,
  Subscription,
  buildStoreContext,
} from "./storeContext.js";
import {
  Mutation,
  applyProxyUpdates,
  applyUpdates,
  performMutationRequest,
} from "./storeMutation.js";
import {LiveQueryOptions, StoreQuery} from "./storeQuery.js";

//
// State.
//

interface State<T extends AnyRecord> {
  versions: RecordVersions<T>;
  state: EntityRecordsState<T>;
  stateSubscriptions: ReadonlyArray<Subscription>;
  queries: Queries<T>;
  queriesSubscriptions: ReadonlyArray<Subscription>;
  liveQueries: LiveQueries<T>;
  liveQueriesSubscriptions: ReadonlyArray<Subscription>;
  lastQueryId: number;
  mutations: ReadonlyArray<Mutation<T>>;
  mutationsSubscriptions: ReadonlyArray<Subscription>;
  blobUrls: Map<string, string>;
  isUpdating: boolean;
}

//
// Store.
//

export interface StoreEntityProviderProps extends PropsWithChildren {
  entity: string;
}

export interface StoreIdentity {
  entityRecord: EntityRecord;
  client: Client;
  blobUrlBuilder: BlobUrlBuilder;
}

export interface StoreProps extends PropsWithChildren {
  identity: StoreIdentity;
  onDisconnectRequest: Handler;
}

export function createStore<R extends CleanRecordType<AnyRecord>[]>(
  ...types: R
) {
  const RIntermediate = IO.union([EntityRecord, EntityRecord, ...types]);
  const RKnownRecord = IO.union([
    RIntermediate,
    StandingRecord,
    SubscriptionRecord,
  ]);

  const RKnownEventRecord = IO.union([RKnownRecord, RNoContentRecord]);
  type T = IO.TypeOf<typeof RKnownRecord>;

  //
  // Store.
  //

  const {StoreContext, useStoreContext} = buildStoreContext<T>();
  const {ProxyStoreContext, useProxyStoreContext} = buildProxyStoreContext<T>();

  const ProxyStore: FC<StoreEntityProviderProps> = props => {
    const {entity, children} = props;
    const storeContext = useStoreContext();

    const accessors = useMemo(
      () => buildAccessors(storeContext.entity, entity),
      [storeContext.entity, entity]
    );

    const context = useMemo<ProxyStoreContextProps<T>>(
      () => ({
        proxyEntity: entity,
        accessors: accessors,
        helpers: buildHelpers(storeContext, accessors, entity),
      }),
      [entity, accessors, storeContext]
    );

    return (
      <ProxyStoreContext.Provider value={context}>
        {children}
      </ProxyStoreContext.Provider>
    );
  };

  function wrapInProxyStore(entity: string) {
    return (children: ReactNode) => {
      return <ProxyStore entity={entity}>{children}</ProxyStore>;
    };
  }

  const Store: FC<StoreProps> = props => {
    const {identity, onDisconnectRequest, children} = props;
    const {entityRecord, client, blobUrlBuilder} = identity;
    const {entity} = entityRecord.author;
    const onDisconnectRequestStable = useStable(onDisconnectRequest);
    const {isMountedRef} = useIsMounted();

    const stateRef = useRef<State<T>>({
      versions: {
        [entityRecord.version!.hash!]: entityRecord,
      },
      state: {
        [entity]: {
          dictionary: {[Record.toKey(entityRecord)]: entityRecord},
          list: [entityRecord],
        },
      },
      stateSubscriptions: [],
      queries: {},
      queriesSubscriptions: [],
      liveQueries: [],
      liveQueriesSubscriptions: [],
      lastQueryId: 0,
      mutations: [],
      mutationsSubscriptions: [],
      blobUrls: new Map(),
      isUpdating: false,
    });

    const updateRecordsInState = useCallback(
      (proxyEntity: string, updater: (records: Records<T>) => Records<T>) => {
        const {state, stateSubscriptions, isUpdating} = stateRef.current;
        if (isUpdating) {
          throw new Error("State is already updating.");
        }

        stateRef.current.isUpdating = true;

        const entityState = state[proxyEntity] || {dictionary: {}, list: []};

        const newRecords = updater(entityState.dictionary);
        if (newRecords === entityState.dictionary) {
          stateRef.current.isUpdating = false;
          return;
        }

        stateRef.current.state = {
          ...state,
          [proxyEntity]: {
            dictionary: newRecords,
            list: Object.values(newRecords),
          },
        };

        stateRef.current.isUpdating = false;
        stateSubscriptions.forEach(s => s());
      },
      []
    );

    const subscribeToState = useCallback((callback: () => void) => {
      stateRef.current.stateSubscriptions = [
        ...stateRef.current.stateSubscriptions,
        callback,
      ];
      return () => {
        stateRef.current.stateSubscriptions =
          stateRef.current.stateSubscriptions.filter(s => s !== callback);
      };
    }, []);

    const getStateSnapshot = useCallback(() => {
      return stateRef.current.state;
    }, []);

    useEffect(() => {
      updateRecordsInState(entity, records => {
        const key = Record.toKey(entityRecord);
        if (records[key as any] === entityRecord) {
          return records;
        }

        return {
          ...records,
          [key]: entityRecord,
        };
      });
    }, [entity, updateRecordsInState, entityRecord]);

    //
    // Mutations.
    //

    const updateRecords = useCallback(
      (
        updates: ReadonlyArray<T | NoContentRecord>,
        proxyEntity: string = entity
      ) => {
        if (stateRef.current.isUpdating) {
          throw new Error("State is already updating.");
        }

        stateRef.current.isUpdating = true;
        const {state, stateSubscriptions} = stateRef.current;
        const {mutations, mutationsSubscriptions} = stateRef.current;

        updates.forEach(r => {
          if ("noContent" in r || !r.version?.hash) {
            return;
          }

          stateRef.current.versions[r.version.hash] = r;
        });

        const updateState = (
          updateEntity: string,
          updater: typeof applyUpdates,
          mutations: ReadonlyArray<Mutation<T>>,
          updates: ReadonlyArray<T | NoContentRecord>
        ) => {
          const entityState = state[updateEntity] || {dictionary: {}, list: []};
          const reduced = updater(entityState.dictionary, mutations, updates);

          if (reduced.state !== entityState.dictionary) {
            stateRef.current.state = {
              ...state,
              [updateEntity]: {
                dictionary: reduced.state,
                list: Object.values(reduced.state),
              },
            };
            return [true, reduced.mutations] as const;
          }

          return [false, reduced.mutations] as const;
        };

        const [wasUpdated, newMutations] = (() => {
          if (proxyEntity === entity) {
            return updateState(entity, applyUpdates, mutations, updates);
          }

          const [wasUpdated1, mutations1] = updateState(
            proxyEntity,
            applyProxyUpdates,
            mutations,
            updates.filter(u => u.source === RecordSource.PROXY)
          );

          const [wasUpdated2, mutations2] = updateState(
            entity,
            applyUpdates,
            mutations1,
            updates.filter(u => u.source !== RecordSource.PROXY)
          );

          return [wasUpdated1 || wasUpdated2, mutations2] as const;
        })();

        stateRef.current.isUpdating = false;

        if (wasUpdated) {
          stateSubscriptions.forEach(s => s());
        }

        if (newMutations !== mutations) {
          stateRef.current.mutations = newMutations;
          mutationsSubscriptions.forEach(s => s());
        }
      },
      [entity]
    );

    const subscribeToMutations = useCallback((callback: () => void) => {
      stateRef.current.mutationsSubscriptions = [
        ...stateRef.current.mutationsSubscriptions,
        callback,
      ];
      return () => {
        stateRef.current.mutationsSubscriptions =
          stateRef.current.mutationsSubscriptions.filter(s => s !== callback);
      };
    }, []);

    useEffect(() => {
      const abortController = new AbortController();
      const {signal} = abortController;
      let isRunning = false;

      const performMutation = async (mutation: Mutation<T>) => {
        // Perform the request.
        const result = await performMutationRequest(
          RKnownRecord,
          RKnownEventRecord,
          entity,
          client,
          mutation,
          signal
        );

        // Re-apply following mutations.
        const {mutations} = stateRef.current;
        const m = mutations.slice(1);
        const updates = m.flatMap(m => [m.record, ...m.followingUpdates]);
        const reduced = applyUpdates(result.state, result.mutations, updates);

        // Update the state.
        if (stateRef.current.isUpdating) {
          throw new Error("State is already updating.");
        }

        updates.map(r => {
          if ("noContent" in r || !r.version?.hash) {
            return;
          }

          stateRef.current.versions[r.version.hash] = r;
        });

        const {state, stateSubscriptions} = stateRef.current;
        const entityState = state[entity] || {dictionary: {}, list: []};

        if (reduced.state !== entityState.dictionary) {
          stateRef.current.state = {
            ...state,
            [entity]: {
              dictionary: reduced.state,
              list: Object.values(reduced.state),
            },
          };
          stateSubscriptions.forEach(s => s());
        }

        return reduced.mutations;
      };

      const performNextMutation = async (): Promise<void> => {
        while (stateRef.current.mutations.length > 0) {
          const activeMutation = stateRef.current.mutations[0]!;

          try {
            const updatedMutations = await performMutation(activeMutation);
            stateRef.current.mutations = updatedMutations;
          } catch (error) {
            // Aborted: nothing to do.
            if (error instanceof AbortedError) {
              return;
            }

            // Unauthorized or Forbidden: disconnect.
            if (
              Http.isError(error, [
                HttpStatusCode.UNAUTHORIZED,
                HttpStatusCode.FORBIDDEN,
              ])
            ) {
              onDisconnectRequestStable();
              return;
            }

            // Other http error: retry.
            if (Http.isError(error)) {
              await Async.delay(1000, signal); // TODO: Evaluate exponential backoff.
              continue;
            }

            // Other error, unexpected.
            throw error;
          }
        }

        stop();
      };

      const start = () => {
        if (isRunning) {
          return;
        }

        isRunning = true;
        performNextMutation();
      };

      const stop = () => {
        isRunning = false;
      };

      const unsubscribe = subscribeToMutations(() => {
        start();
      });
      start();

      return () => {
        abortController.abort();
        unsubscribe();
        stop();
      };
    }, [subscribeToMutations, entity, client, onDisconnectRequestStable]);

    //
    // Queries.
    //

    const updateQueries = useCallback(
      (updater: (queries: Queries<T>) => Queries<T>) => {
        const {queries, isUpdating, queriesSubscriptions} = stateRef.current;
        if (isUpdating) {
          throw new Error("State is already updating.");
        }

        stateRef.current.isUpdating = true;

        const newQueries = updater(queries);
        if (newQueries === queries) {
          stateRef.current.isUpdating = false;
          return;
        }

        stateRef.current.queries = newQueries;
        stateRef.current.isUpdating = false;
        queriesSubscriptions.forEach(s => s());
      },
      []
    );

    const subscribeToQueries = useCallback((callback: () => void) => {
      stateRef.current.queriesSubscriptions = [
        ...stateRef.current.queriesSubscriptions,
        callback,
      ];
      return () => {
        stateRef.current.queriesSubscriptions =
          stateRef.current.queriesSubscriptions.filter(s => s !== callback);
      };
    }, []);

    const getQueriesSnapshot = useCallback(() => {
      return stateRef.current.queries;
    }, []);

    const updateLiveQueries = useCallback(
      (updater: (queries: LiveQueries<T>) => LiveQueries<T>) => {
        if (stateRef.current.isUpdating) {
          throw new Error("State is already updating.");
        }

        const {liveQueries, liveQueriesSubscriptions} = stateRef.current;

        stateRef.current.isUpdating = true;
        const newLiveQueries = updater(liveQueries);

        if (newLiveQueries === liveQueries) {
          stateRef.current.isUpdating = false;
          return;
        }

        stateRef.current.liveQueries = newLiveQueries;
        stateRef.current.isUpdating = false;
        liveQueriesSubscriptions.forEach(s => s());
      },
      []
    );

    const subscribeToLiveQueries = useCallback((callback: () => void) => {
      stateRef.current.liveQueriesSubscriptions = [
        ...stateRef.current.liveQueriesSubscriptions,
        callback,
      ];
      return () => {
        stateRef.current.liveQueriesSubscriptions =
          stateRef.current.liveQueriesSubscriptions.filter(s => s !== callback);
      };
    }, []);

    const getLiveQueriesSnapshot = useCallback(() => {
      return stateRef.current.liveQueries;
    }, []);

    const findLiveQueryMatch = useCallback(
      <Q extends T>(query: StoreQuery<T, Q>) => {
        const {liveQueries} = stateRef.current;

        for (let i = liveQueries.length - 1; i >= 0; i--) {
          const q = liveQueries[i];
          if (!q || q.id === query.id) {
            continue;
          }

          if (Query.isSyncSuperset(q.query, query.query)) {
            return q;
          }
        }

        return undefined;
      },
      []
    );

    const registerQuery = useCallback(
      <Q extends T>(query: Query<Q>, options: RegisterQueryOptions) => {
        const {isFetch, isSync, isLocalTracked} = options;
        const {queries, lastQueryId} = stateRef.current;
        const equal = (() => {
          for (let i = lastQueryId; i > 0; i--) {
            const q = queries[i];
            if (!q || q.isDisplayed) {
              continue;
            }

            if (Query.isMatch(q.query, query)) {
              return q;
            }
          }

          return undefined;
        })();

        if (equal) {
          return equal as StoreQuery<T, Q>;
        }

        const match = (() => {
          for (let i = lastQueryId; i > 0; i--) {
            const q = queries[i];
            if (!q) {
              continue;
            }

            // If this is a complete query, it only needs to be a superset.
            if (q.isComplete && Query.isSuperset(q.query, query)) {
              return q;
            }

            // Otherwise, it needs to be a match.
            if (Query.isMatch(q.query, query)) {
              return q;
            }
          }

          return undefined;
        })();

        const syncMatch = match && findLiveQueryMatch(match);
        const queryId = ++stateRef.current.lastQueryId;

        const performQuery = async () => {
          let keepGoing = true;

          while (keepGoing) {
            keepGoing = false;

            try {
              const response = await client.getRecords(
                RKnownRecord,
                RKnownRecord,
                query
              );

              if (!isMountedRef.current) {
                return;
              }

              const responseRecords = [
                ...response.linkedRecords,
                ...response.records,
              ];

              updateRecords(responseRecords, query.proxyTo || entity);

              updateQueries(value => {
                const currentQuery = value[queryId];
                if (!currentQuery) {
                  throw new Error("Query not found.");
                }

                return {
                  ...value,
                  [queryId]: {
                    ...currentQuery,
                    promise: undefined,
                    isComplete: !response.nextPage,
                    recordVersions: response.records.map(Record.toVersionHash),
                  },
                };
              });
            } catch (error) {
              // Unmounted: nothing to do.
              if (!isMountedRef.current) {
                return;
              }

              // Permanent error: mark as failed.
              if (
                Http.isError(error, [
                  HttpStatusCode.BAD_REQUEST,
                  HttpStatusCode.INTERNAL_SERVER_ERROR,
                ])
              ) {
                updateQueries(value => {
                  const currentQuery = value[queryId];
                  if (!currentQuery) {
                    throw new Error("Query not found.");
                  }

                  return {
                    ...value,
                    [queryId]: {
                      ...currentQuery,
                      promise: undefined,
                      error: error,
                    },
                  };
                });
                return;
              }

              // Transient error: retry.
              await Async.delay(2000);
              keepGoing = true;
            }
          }
        };

        const newQuery: StoreQuery<T, Q> = {
          id: queryId,
          query,
          promise: syncMatch || !isFetch ? undefined : performQuery(),
          isSync,
          isComplete: match?.isComplete || isLocalTracked,
          isDisplayed: false,
          error: undefined,
          recordVersions: match?.recordVersions,
        };

        updateQueries(value => ({
          ...value,
          [queryId]: newQuery,
        }));

        return newQuery;
      },
      [
        updateQueries,
        findLiveQueryMatch,
        entity,
        client,
        isMountedRef,
        updateRecords,
      ]
    );

    const registerLiveQuery = useCallback(
      (query: StoreQuery<T, T>) => {
        if (!query.isSync) {
          return undefined;
        }

        const {liveQueries} = stateRef.current;
        for (let i = liveQueries.length - 1; i >= 0; i--) {
          const q = liveQueries[i];
          if (!q || q.id === query.id) {
            continue;
          }

          if (Query.isSyncSuperset(q.query, query.query)) {
            return undefined;
          }
        }

        updateLiveQueries(value => uniqBy([query, ...value], q => q.id));
        return () => {
          updateLiveQueries(value => value.filter(q => q !== query));
        };
      },
      [updateLiveQueries]
    );

    //
    // Helpers.
    //

    const uploadBlob = useCallback(
      async (blob: Blob, signal?: AbortSignal) => {
        const blobResponse = await client.uploadBlob(blob, signal);

        // TODO: Memory management.
        // TODO: React Native compatibility.
        const blobUrl = URL.createObjectURL(blob);
        stateRef.current.blobUrls.set(blobResponse.hash, blobUrl);

        return blobResponse;
      },
      [client]
    );

    const buildBlobUrl = useCallback(
      <R extends T>(
        record: R,
        blob: AnyBlobLink,
        expiresInSeconds?: number
      ) => {
        const blobUrl = stateRef.current.blobUrls.get(blob.hash);
        if (blobUrl) {
          return blobUrl;
        }

        return blobUrlBuilder(record, blob, expiresInSeconds);
      },
      [blobUrlBuilder]
    );

    //
    // Context.
    //

    const {versions} = stateRef.current;
    const context = useMemo<StoreContextProps<T>>(() => {
      const result: StoreContextProps<T> = {
        entity,
        client,
        versions,
        updateRecords,
        uploadBlob,
        buildBlobUrl,
        onDisconnectRequest: onDisconnectRequestStable,
        subscribeToState,
        getStateSnapshot,
        subscribeToQueries,
        getQueriesSnapshot,
        subscribeToLiveQueries,
        getLiveQueriesSnapshot,
        registerQuery,
        registerLiveQuery,
      };

      return result;
    }, [
      entity,
      client,
      versions,
      updateRecords,
      uploadBlob,
      buildBlobUrl,
      onDisconnectRequestStable,
      subscribeToState,
      getStateSnapshot,
      subscribeToQueries,
      getQueriesSnapshot,
      subscribeToLiveQueries,
      getLiveQueriesSnapshot,
      registerQuery,
      registerLiveQuery,
    ]);

    return (
      <StoreContext.Provider value={context}>
        <ProxyStore entity={entity}>{children}</ProxyStore>
      </StoreContext.Provider>
    );
  };

  function useReferenceStateSelector<R>(selector: Selector<T, R>) {
    const {subscribeToState, getStateSnapshot} = useStoreContext();
    return useSyncExternalStoreWithSelector(
      subscribeToState,
      getStateSnapshot,
      null,
      selector,
      isReferenceEqual
    );
  }

  function useShallowStateSelector<R>(selector: Selector<T, R>) {
    const {subscribeToState, getStateSnapshot} = useStoreContext();
    return useSyncExternalStoreWithSelector(
      subscribeToState,
      getStateSnapshot,
      null,
      selector,
      isShallowEqual
    );
  }

  function useQuery<Q extends T>(queryId: number) {
    const selector = useCallback(
      (queries: Queries<T>) => {
        return queries[queryId] as StoreQuery<T, Q> | undefined;
      },
      [queryId]
    );

    const {subscribeToQueries, getQueriesSnapshot} = useStoreContext();
    return useSyncExternalStoreWithSelector(
      subscribeToQueries,
      getQueriesSnapshot,
      null,
      selector,
      isReferenceEqual
    );
  }

  function useShouldSync<Q extends T>(query: StoreQuery<T, Q>) {
    const selector = useCallback(
      (liveQueries: LiveQueries<T>) => {
        if (!query.isSync) {
          return false;
        }

        for (let i = liveQueries.length - 1; i >= 0; i--) {
          const q = liveQueries[i];
          if (!q || q.id === query.id) {
            continue;
          }

          if (Query.isSyncSuperset(q.query, query.query)) {
            return false;
          }
        }

        return true;
      },
      [query]
    );

    const {subscribeToLiveQueries, getLiveQueriesSnapshot} = useStoreContext();
    return useSyncExternalStoreWithSelector(
      subscribeToLiveQueries,
      getLiveQueriesSnapshot,
      null,
      selector,
      isReferenceEqual
    );
  }

  //
  // Queries.
  //

  function useRecordsQuery<Q extends T>(
    requestedQuery: LiveQuery<Q>,
    options: LiveQueryOptions = {}
  ) {
    type Result = ReadonlyArray<Q>;
    const mode = options.mode || "fetch";
    const storeContext = useStoreContext();
    const {entity, client, updateRecords} = storeContext;
    const {registerQuery, registerLiveQuery} = storeContext;

    //
    // State.
    //

    const isFetch = mode === "fetch";
    const isTracked = mode !== "local";
    const isLocalTracked = mode === "local-tracked";
    const isSync = mode !== "local" && mode !== "local-tracked";

    const initialStoreQuery = useDeepMemo<StoreQuery<T, Q>>(() => {
      if (isTracked) {
        return registerQuery(requestedQuery, {isFetch, isSync, isLocalTracked});
      }

      return {
        id: -1,
        query: requestedQuery,
        promise: undefined,
        isSync: false,
        isComplete: isLocalTracked,
        isDisplayed: true,
        error: undefined,
        recordVersions: undefined,
      };
    }, [isFetch, isTracked, isSync, isLocalTracked, requestedQuery]);

    const trackedQuery = useQuery<Q>(initialStoreQuery.id);
    const storeQuery = trackedQuery || initialStoreQuery;
    const {query, promise, error} = storeQuery;

    useEffect(() => {
      storeQuery.isDisplayed = true;
    }, [storeQuery]);

    //
    // Result.
    //

    const recordsSelector = useCallback(
      (state: EntityRecordsState<T>): Result => {
        if (promise) {
          return [];
        }

        return Query.filter(state[entity]?.list || [], query);
      },
      [promise, entity, query]
    );

    const records = useShallowStateSelector(recordsSelector);

    const lastQueryRef = useRef<StoreQuery<T, Q>>();
    useEffect(() => {
      if (storeQuery.promise) {
        return;
      }

      lastQueryRef.current = storeQuery;
    }, [storeQuery]);

    const lastStoreQuery = lastQueryRef.current;
    const deferredStoreQuery = (promise && lastStoreQuery) || storeQuery;
    const deferredQuery = deferredStoreQuery.query;

    const deferredRecordsSelector = useCallback(
      (state: EntityRecordsState<T>): Result => {
        if (query === deferredQuery) {
          return records;
        }

        return Query.filter(state[entity]?.list || [], deferredQuery);
      },
      [entity, query, deferredQuery, records]
    );

    const deferredRecords = useShallowStateSelector(deferredRecordsSelector);

    //
    // Suspense getters.
    //

    const getRecords = useCallback(() => {
      if (promise) {
        throw promise;
      }

      return records;
    }, [promise, records]);

    const getDeferredRecords = useCallback(() => {
      if (!lastStoreQuery) {
        return getRecords();
      }

      return deferredRecords;
    }, [lastStoreQuery, getRecords, deferredRecords]);

    //
    // Sync.
    //

    const shouldSync = useShouldSync(storeQuery);

    const getMaxRecordDateRef = useRef<() => Date | undefined>();
    useEffect(() => {
      getMaxRecordDateRef.current = () => {
        if (!isFetch || !isSync || promise || !shouldSync) {
          return undefined;
        }

        return orderBy(getRecords(), t => t.version?.receivedAt, "desc")
          .map(t => t.version?.receivedAt)
          .filter(isDefined)[0];
      };
    }, [isFetch, isSync, promise, shouldSync, getRecords, query]);

    useEffect(() => {
      const currentGetMaxRecordDate = getMaxRecordDateRef.current;
      if (promise || !currentGetMaxRecordDate) {
        return undefined;
      }

      const unregister = registerLiveQuery(storeQuery);
      if (!unregister) {
        return undefined;
      }

      const abort = new AbortController();
      const maxRecordDate = currentGetMaxRecordDate();
      const onRecord = (record: AnyRecord | NoContentRecord) => {
        console.log("Received record:", record);
        updateRecords([record]);
      };

      const sseQuery: Query<T> = {
        ...storeQuery.query,
        min: maxRecordDate,
        includeDeleted: true,
      };

      client.recordEventSource(
        RKnownEventRecord,
        onRecord,
        sseQuery,
        abort.signal
      );
      return () => {
        abort.abort();
        unregister();
      };
    }, [promise, registerLiveQuery, storeQuery, client, updateRecords]);

    return {
      isLoading: Boolean(promise),
      error,
      records,
      deferredRecords,
      getRecords,
      getDeferredRecords,
      query,
      deferredQuery,
    };
  }

  function useStaticRecordsQuery<Q extends T>(requestedQuery: Query<Q>) {
    type Result = ReadonlyArray<Q>;
    const {versions, registerQuery} = useStoreContext();

    //
    // State.
    //

    const initialStoreQuery = useDeepMemo<StoreQuery<T, Q>>(() => {
      return registerQuery(requestedQuery, {
        isFetch: true,
        isSync: false,
        isLocalTracked: false,
      });
    }, [requestedQuery]);

    const trackedQuery = useQuery<Q>(initialStoreQuery.id);
    const storeQuery = trackedQuery || initialStoreQuery;
    const {query, promise, error, recordVersions} = storeQuery;

    useEffect(() => {
      storeQuery.isDisplayed = true;
    }, [storeQuery]);

    const records = useMemo((): Result => {
      if (!recordVersions) {
        return [];
      }

      return recordVersions.map(v => versions[v]! as Q);
    }, [recordVersions, versions]);

    const lastQueryRef = useRef<StoreQuery<T, Q>>();
    useEffect(() => {
      if (storeQuery.promise) {
        return;
      }

      lastQueryRef.current = storeQuery;
    }, [storeQuery]);

    const lastStoreQuery = lastQueryRef.current;
    const deferredStoreQuery = (promise && lastStoreQuery) || storeQuery;
    const deferredQuery = deferredStoreQuery.query;
    const deferredRecordVersions = deferredStoreQuery.recordVersions;
    const isSameDeferred = deferredQuery === query;

    const deferredRecords = useMemo((): Result => {
      if (isSameDeferred) {
        return records;
      }

      if (!deferredRecordVersions) {
        return [];
      }

      return deferredRecordVersions.map(v => versions[v]! as Q);
    }, [isSameDeferred, deferredRecordVersions, records, versions]);

    //
    // Suspense getters.
    //

    const getRecords = useCallback(() => {
      if (promise && !recordVersions) {
        throw promise;
      }

      return records;
    }, [promise, recordVersions, records]);

    const getDeferredRecords = useCallback(() => {
      if (!lastStoreQuery) {
        return getRecords();
      }

      return deferredRecords;
    }, [lastStoreQuery, getRecords, deferredRecords]);

    //
    // Context.
    //

    return {
      isLoading: Boolean(promise),
      error,
      hasResults: Boolean(recordVersions),
      records,
      deferredRecords,
      getRecords,
      getDeferredRecords,
      query,
      deferredQuery,
    };
  }

  function useRecordQueryBase<Q extends T>(
    queryResult:
      | ReturnType<typeof useRecordsQuery<Q>>
      | ReturnType<typeof useStaticRecordsQuery<Q>>
  ) {
    const {isLoading, records, deferredRecords} = queryResult;
    const {query, deferredQuery, getRecords, getDeferredRecords} = queryResult;

    const localRecord = useFindRecordByQuery(query);
    const isInitialQuery = query === deferredQuery;

    const record = useMemo(() => {
      if (isLoading) {
        return localRecord;
      }

      const firstRecord = records[0];
      if (!firstRecord || records.length > 1) {
        return undefined;
      }

      return firstRecord;
    }, [isLoading, localRecord, records]);

    const deferredRecord = useMemo(() => {
      if (!isLoading || isInitialQuery) {
        return record;
      }

      const firstRecord = deferredRecords[0];
      if (!firstRecord || deferredRecords.length > 1) {
        return undefined;
      }

      return firstRecord;
    }, [isLoading, isInitialQuery, record, deferredRecords]);

    //
    // Suspense getters.
    //

    const getRecord = useMemo(
      () =>
        memoize(() => {
          try {
            const records = getRecords();
            const firstRecord = records[0];

            if (!firstRecord || records.length > 1) {
              return undefined;
            }

            return firstRecord;
          } catch (err) {
            if (!isPromise(err)) {
              throw err;
            }

            if (!localRecord) {
              throw err;
            }

            return localRecord;
          }
        }),
      [localRecord, getRecords]
    );

    const getDeferredRecord = useMemo(
      () =>
        memoize(() => {
          try {
            const records = getDeferredRecords();
            const firstRecord = records[0];

            if (!firstRecord || records.length > 1) {
              return undefined;
            }

            return firstRecord;
          } catch (err) {
            if (!isPromise(err)) {
              throw err;
            }

            if (!localRecord || !isInitialQuery) {
              throw err;
            }

            return localRecord;
          }
        }),
      [isInitialQuery, localRecord, getDeferredRecords]
    );

    return {
      isLoading,
      record,
      deferredRecord,
      getRecord,
      getDeferredRecord,
    };
  }

  function useRecordQuery<Q extends T>(
    requestedQuery: LiveQuery<Q>,
    options: LiveQueryOptions = {}
  ) {
    // TODO: Use nextPage info instead of requesting 2.
    const queryResult = useRecordsQuery(
      {...requestedQuery, pageSize: 2},
      options
    );
    return useRecordQueryBase(queryResult);
  }

  function useStaticRecordQuery<Q extends T>(requestedQuery: Query<Q>) {
    const queryResult = useStaticRecordsQuery({...requestedQuery, pageSize: 2});
    return useRecordQueryBase(queryResult);
  }

  //
  // Helpers.
  //

  function useRecordHelpers() {
    return useProxyStoreContext().helpers;
  }

  function useRecordByVersion<Q extends T, K extends RecordKey<Q> | undefined>(
    version: VersionHash<Q> | K
  ) {
    const {recordByVersion} = useProxyStoreContext().helpers;

    return useMemo(():
      | Extract<T, Q>
      | (undefined extends K ? undefined : never) => {
      if (!version) {
        return undefined as any;
      }

      return recordByVersion(version);
    }, [version, recordByVersion]);
  }

  function useRecordByKey<Q extends T, K extends RecordKey<Q> | undefined>(
    key: RecordKey<Q> | K
  ) {
    const {recordByKey} = useProxyStoreContext().accessors;
    const selector = useCallback(
      (
        state: EntityRecordsState<T>
      ): Extract<T, Q> | (undefined extends K ? undefined : never) => {
        if (!key) {
          return undefined as any;
        }

        return recordByKey(() => state)(key);
      },
      [recordByKey, key]
    );

    return useReferenceStateSelector(selector);
  }

  function useFindRecordByKey<Q extends T>(key: RecordKey<Q> | undefined) {
    const {findRecordByKey} = useProxyStoreContext().accessors;
    const selector = useCallback(
      (state: EntityRecordsState<T>) => {
        if (!key) {
          return undefined;
        }

        return findRecordByKey(() => state)(key);
      },
      [findRecordByKey, key]
    );

    return useReferenceStateSelector(selector);
  }

  function useFindRecordByQuery<Q extends T>(query: Query<Q> | undefined) {
    const {findRecordByQuery} = useProxyStoreContext().accessors;
    const selector = useCallback(
      (state: EntityRecordsState<T>) => {
        if (!query) {
          return undefined;
        }

        return findRecordByQuery(() => state)(query);
      },
      [findRecordByQuery, query]
    );

    return useReferenceStateSelector(selector);
  }

  function useFindEntityRecord(entity: string | undefined) {
    const {findEntityRecord} = useProxyStoreContext().accessors;
    const selector = useCallback(
      (state: EntityRecordsState<T>) => {
        if (!entity) {
          return undefined;
        }

        return findEntityRecord(() => state)(entity);
      },
      [findEntityRecord, entity]
    );

    return useReferenceStateSelector(selector);
  }

  function useFindStandingDecision(entity: string | undefined) {
    const {findStandingDecision} = useProxyStoreContext().accessors;
    const selector = useCallback(
      (state: EntityRecordsState<T>): `${StandingDecision}` => {
        if (!entity) {
          return StandingDecision.UNDECIDED;
        }

        return findStandingDecision(() => state)(entity);
      },
      [findStandingDecision, entity]
    );

    return useReferenceStateSelector(selector);
  }

  return {
    RKnownRecord,
    ProxyStore,
    Store,
    wrapInProxyStore,
    useRecordsQuery,
    useStaticRecordsQuery,
    useRecordQuery,
    useStaticRecordQuery,
    useRecordHelpers,
    useRecordByVersion,
    useRecordByKey,
    useFindRecordByKey,
    useFindRecordByQuery,
    useFindEntityRecord,
    useFindStandingDecision,
  };
}
