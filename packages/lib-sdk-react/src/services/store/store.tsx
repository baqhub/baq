import {
  AbortedError,
  AnyBlobLink,
  AnyRecord,
  Array,
  Async,
  CleanRecordType,
  EntityRecord,
  Handler,
  Http,
  HttpStatusCode,
  IO,
  LiveQuery,
  NoContentRecord,
  Query,
  QueryDate,
  RNoContentRecord,
  Record,
  RecordKey,
  RecordSource,
  StandingDecision,
  StandingRecord,
  Str,
  SubscriptionRecord,
  VersionHash,
  isDefined,
  isPromise,
} from "@baqhub/sdk";
import isEqual from "lodash/isEqual.js";
import memoize from "lodash/memoize.js";
import orderBy from "lodash/orderBy.js";
import uniq from "lodash/uniq.js";
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
import {useSyncExternalStoreWithSelector} from "use-sync-external-store/with-selector";
import {isReferenceEqual, isShallowEqual} from "../../helpers/equality.js";
import {
  abortable,
  useDeepMemo,
  useIsMounted,
  useStable,
} from "../../helpers/hooks.js";
import {
  ProxyStoreContextProps,
  buildAccessors,
  buildHelpers,
  buildProxyStoreContext,
} from "./proxyStore.js";
import {
  EntityRecordsState,
  Queries,
  QueriesList,
  RecordVersions,
  Records,
  RegisterQueryOptions,
  Selector,
  StoreContextProps,
  Subscription,
  buildStoreContext,
} from "./storeContext.js";
import {StoreIdentity} from "./storeIdentity.js";
import {
  Mutation,
  applyProxyUpdates,
  applyUpdates,
  performMutationRequest,
} from "./storeMutation.js";
import {
  StoreQuery,
  UseRecordQueryOptions,
  UseRecordsQueryOptions,
  UseStaticRecordQueryOptions,
  UseStaticRecordsQueryOptions,
  staticRecordQueryOptionsToRefreshSpec,
} from "./storeQuery.js";

//
// State.
//

interface State<T extends AnyRecord> {
  versions: RecordVersions<T>;
  state: EntityRecordsState<T>;
  stateSubscriptions: ReadonlyArray<Subscription>;
  queries: Queries<T>;
  queriesSubscriptions: ReadonlyArray<Subscription>;
  liveQueries: QueriesList<T>;
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

export interface StoreProps extends PropsWithChildren {
  identity?: StoreIdentity;
  onDisconnectRequest?: Handler;
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
    const {onDisconnectRequest, children} = props;
    const identity = useMemo(() => {
      return props.identity || StoreIdentity.newUnauthenticated();
    }, [props.identity]);

    const {entityRecord, findClient, blobUrlBuilder} = identity;
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
        const client = findClient(entity);
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
    }, [subscribeToMutations, entity, findClient, onDisconnectRequestStable]);

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
      (updater: (queries: QueriesList<T>) => QueriesList<T>) => {
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

    const registerQuery = useCallback(
      <Q extends T>(query: Query<Q>, options: RegisterQueryOptions) => {
        const {isFetch, isSync, isLocalTracked} = options;
        const {refreshSpec, loadMorePageSize} = options;
        const {queries, lastQueryId, liveQueries} = stateRef.current;
        const equal = (() => {
          for (let i = lastQueryId; i > 0; i--) {
            const q = queries[i];
            if (!q || q.isDisplayed || !isEqual(q.refreshSpec, refreshSpec)) {
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
          if (isLocalTracked) {
            return undefined;
          }

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

        const syncMatch = match && findLiveQueryMatch(liveQueries, match);
        const queryId = ++stateRef.current.lastQueryId;

        const makeLoadMore = (loadMoreQuery: string) => {
          // Cannot load more in full refresh mode.
          if (refreshSpec?.mode === "full") {
            return undefined;
          }

          return () => {
            updateQueries(value => {
              const currentQuery = value[queryId];
              if (!currentQuery) {
                throw new Error("Query not found.");
              }

              if (currentQuery.loadMorePromise) {
                return value;
              }

              const loadMorePromise = performLoadMoreQuery(loadMoreQuery);
              return {
                ...value,
                [queryId]: {
                  ...currentQuery,
                  loadMorePromise,
                },
              };
            });
          };
        };

        const performQuery = async () => {
          const queryState1 = stateRef.current.queries[queryId];
          if (queryState1?.loadMorePromise) {
            await queryState1.loadMorePromise;
          }

          let keepGoing = true;

          while (keepGoing) {
            keepGoing = false;

            try {
              const client = findClient(query.proxyTo || entity);
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

                const loadMore = response.nextPage
                  ? makeLoadMore(response.nextPage)
                  : undefined;

                // Loaded boundary.
                const last = Array.last(response.records);
                const loadedBoundary =
                  response.nextPage && last
                    ? Query.findBoundary(query, last)
                    : undefined;

                // Refresh boundary.
                const max = orderBy(
                  response.records,
                  t => t.version!.receivedAt,
                  "desc"
                )[0];
                const refreshBoundary = max && Query.findBoundary(query, max);

                return {
                  ...value,
                  [queryId]: {
                    ...currentQuery,
                    promise: undefined,
                    error: undefined,
                    refreshCount: currentQuery.refreshCount + 1,
                    refreshBoundary,
                    loadMorePromise: undefined,
                    loadMoreError: undefined,
                    loadMoreQuery: response.nextPage,
                    loadMore,
                    isComplete: !response.nextPage,
                    loadedBoundary,
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
                  HttpStatusCode.NOT_FOUND,
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

        const performRefreshSyncQuery = async () => {
          const queryState1 = stateRef.current.queries[queryId]!;
          if (queryState1.loadMorePromise) {
            await queryState1.loadMorePromise;
          }

          //
          // Find the upper boundary we currently have.
          //

          const queryState2 = stateRef.current.queries[queryId]!;
          if (!queryState2.refreshBoundary) {
            return performQuery();
          }

          const refreshQuery = Query.toSync(query, queryState2.refreshBoundary);

          //
          // Perform the refresh query.
          //

          let keepGoing = true;

          while (keepGoing) {
            keepGoing = false;

            try {
              const client = findClient(query.proxyTo || entity);
              const response = await client.getRecords(
                RKnownRecord,
                RKnownRecord,
                refreshQuery
              );

              if (!isMountedRef.current) {
                return;
              }

              // If there are too many items to sync, full refresh.
              if (response.nextPage) {
                return performQuery();
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

                const queryRecords = (currentQuery.recordVersions || []).map(
                  version => stateRef.current.versions[version]! as Q
                );

                const recordVersions = Query.filter(
                  currentQuery.query,
                  uniqBy(response.records.concat(queryRecords), r => r.id),
                  {ignorePageSize: true, boundary: currentQuery.loadedBoundary}
                ).map(Record.toVersionHash);

                const max = orderBy(
                  response.records,
                  t => t.version!.receivedAt,
                  "desc"
                )[0];
                const refreshBoundary: QueryDate | undefined =
                  (max && [max.version!.receivedAt!, max.id]) ||
                  currentQuery.refreshBoundary;

                return {
                  ...value,
                  [queryId]: {
                    ...currentQuery,
                    promise: undefined,
                    error: undefined,
                    refreshCount: currentQuery.refreshCount + 1,
                    refreshBoundary,
                    recordVersions,
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
                  HttpStatusCode.NOT_FOUND,
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

        const performLoadMoreQuery = async (loadMoreQuery: string) => {
          const queryState1 = stateRef.current.queries[queryId]!;
          if (queryState1.promise) {
            await queryState1.promise;
          }

          await null;
          const queryState2 = stateRef.current.queries[queryId]!;
          if (!queryState2.loadMorePromise) {
            return;
          }

          let keepGoing = true;

          while (keepGoing) {
            keepGoing = false;

            try {
              const client = findClient(query.proxyTo || entity);

              const patchedLoadMoreQuery = loadMorePageSize
                ? Str.buildQuery([
                    ["page_size", loadMorePageSize.toString()] as const,
                    ...Str.parseQuery(loadMoreQuery).filter(
                      ([key]) => key !== "page_size"
                    ),
                  ])
                : loadMoreQuery;

              const response = await client.getMoreRecords(
                RKnownRecord,
                RKnownRecord,
                patchedLoadMoreQuery
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

                const loadMore = response.nextPage
                  ? makeLoadMore(response.nextPage)
                  : undefined;

                const recordVersions = uniq(
                  (currentQuery.recordVersions || []).concat(
                    response.records.map(Record.toVersionHash)
                  )
                );

                const last = Array.last(response.records);
                const boundary = last && Query.findBoundary(query, last);

                return {
                  ...value,
                  [queryId]: {
                    ...currentQuery,
                    loadMorePromise: undefined,
                    loadMoreError: undefined,
                    loadMoreQuery: response.nextPage,
                    loadMore,
                    isComplete: !response.nextPage,
                    loadedBoundary: response.nextPage ? boundary : undefined,
                    recordVersions,
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
                  HttpStatusCode.NOT_FOUND,
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
                      loadMorePromise: undefined,
                      loadMoreError: error,
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

        const refresh = (refreshCount: number) => {
          updateQueries(value => {
            const currentQuery = value[queryId];
            if (!currentQuery) {
              throw new Error("Query not found.");
            }

            if (
              !refreshSpec ||
              currentQuery.promise ||
              !currentQuery.recordVersions ||
              refreshCount !== currentQuery.refreshCount
            ) {
              return value;
            }

            const promise =
              refreshSpec.mode === "full"
                ? performQuery()
                : performRefreshSyncQuery();

            return {
              ...value,
              [queryId]: {
                ...currentQuery,
                promise,
              },
            };
          });
        };

        const newQuery: StoreQuery<T, Q> = {
          id: queryId,
          query,
          promise: syncMatch || !isFetch ? undefined : performQuery(),
          refreshSpec,
          refresh,
          refreshCount: 0,
          refreshBoundary: undefined,
          loadMorePromise: undefined,
          loadMoreError: undefined,
          loadMoreQuery: match?.loadMoreQuery,
          loadMore: match?.loadMoreQuery
            ? makeLoadMore(match.loadMoreQuery)
            : undefined,
          isSync,
          isComplete: match?.isComplete || isLocalTracked,
          isDisplayed: false,
          error: undefined,
          loadedBoundary: match?.loadedBoundary,
          recordVersions: match?.recordVersions,
        };

        updateQueries(value => ({
          ...value,
          [queryId]: newQuery,
        }));

        return newQuery;
      },
      [updateQueries, entity, findClient, isMountedRef, updateRecords]
    );

    const registerLiveQuery = useCallback(
      (query: StoreQuery<T, T>) => {
        if (!query.isSync) {
          return undefined;
        }

        if (findLiveQueryMatch(stateRef.current.liveQueries, query)) {
          return undefined;
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
        const client = findClient(entity);
        const blobResponse = await client.uploadBlob(blob, signal);

        // TODO: Memory management.
        // TODO: React Native compatibility.
        const blobUrl = URL.createObjectURL(blob);
        stateRef.current.blobUrls.set(blobResponse.hash, blobUrl);

        return blobResponse;
      },
      [findClient, entity]
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
        isAuthenticated: identity.isAuthenticated,
        entity: identity.entityRecord.author.entity,
        findClient: identity.findClient,
        discover: identity.discover,
        downloadBlob: identity.downloadBlob,
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
      identity,
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
      (liveQueries: QueriesList<T>) => {
        if (!query.isSync) {
          return false;
        }

        return !findLiveQueryMatch(liveQueries, query);
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
    options: UseRecordsQueryOptions = {}
  ) {
    type Result = ReadonlyArray<Q>;
    const {loadMorePageSize} = options;
    const mode = options.mode || "fetch";
    const storeContext = useStoreContext();
    const {isAuthenticated, entity, findClient, updateRecords} = storeContext;
    const {registerQuery, registerLiveQuery} = storeContext;

    if (!isAuthenticated) {
      throw new Error("useRecordsQuery() requires an authenticated Store.");
    }

    //
    // State.
    //

    const isFetch = mode === "fetch";
    const isTracked = mode !== "local";
    const isLocalTracked = mode === "local-tracked";
    const isSync = mode !== "local" && mode !== "local-tracked";

    const initialStoreQuery = useDeepMemo<StoreQuery<T, Q>>(() => {
      if (isTracked) {
        return registerQuery(requestedQuery, {
          isFetch,
          isSync,
          isLocalTracked,
          refreshSpec: undefined,
          loadMorePageSize,
        });
      }

      return {
        id: -1,
        query: requestedQuery,
        promise: undefined,
        error: undefined,
        refreshSpec: undefined,
        refreshCount: 0,
        refreshBoundary: undefined,
        refresh: () => {},
        loadMorePromise: undefined,
        loadMoreError: undefined,
        loadMoreQuery: undefined,
        loadMore: undefined,
        isSync: false,
        isComplete: isLocalTracked,
        isDisplayed: true,
        loadedBoundary: undefined,
        recordVersions: undefined,
      };
    }, [
      isFetch,
      isTracked,
      isSync,
      isLocalTracked,
      loadMorePageSize,
      requestedQuery,
    ]);

    const trackedQuery = useQuery<Q>(initialStoreQuery.id);
    const storeQuery = trackedQuery || initialStoreQuery;
    const {query, promise, error, loadedBoundary} = storeQuery;
    const {loadMorePromise, loadMoreError, loadMore} = storeQuery;

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

        return Query.filter(query, state[entity]?.list || [], {
          ignorePageSize: true,
          boundary: loadedBoundary,
        });
      },
      [promise, entity, query, loadedBoundary]
    );

    const records = useShallowStateSelector(recordsSelector);

    const lastQueryRef = useRef<StoreQuery<T, Q>>(undefined);
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

        return Query.filter(deferredQuery, state[entity]?.list || [], {
          ignorePageSize: true,
          boundary: loadedBoundary,
        });
      },
      [entity, query, deferredQuery, loadedBoundary, records]
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

    const getMaxRecordDateRef = useRef<() => Date | undefined>(undefined);
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

      const client = findClient(entity);
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
    }, [
      promise,
      registerLiveQuery,
      storeQuery,
      entity,
      findClient,
      updateRecords,
    ]);

    return {
      isLoading: Boolean(promise),
      error,
      isLoadingMore: Boolean(loadMorePromise),
      loadMoreError,
      loadMore,
      records,
      deferredRecords,
      getRecords,
      getDeferredRecords,
      query,
      deferredQuery,
    };
  }

  function useStaticRecordsQuery<Q extends T>(
    requestedQuery: Query<Q>,
    options: UseStaticRecordsQueryOptions = {}
  ) {
    type Result = ReadonlyArray<Q>;
    const storeContext = useStoreContext();
    const {isAuthenticated, versions} = storeContext;
    const {registerQuery} = storeContext;

    if (!isAuthenticated && !requestedQuery.proxyTo) {
      throw new Error(
        "useStaticRecordsQuery() requires an authenticated Store for non-proxied queries."
      );
    }

    //
    // State.
    //

    const initialStoreQuery = useDeepMemo<StoreQuery<T, Q>>(() => {
      return registerQuery(requestedQuery, {
        isFetch: true,
        isSync: false,
        isLocalTracked: false,
        refreshSpec: staticRecordQueryOptionsToRefreshSpec(options),
        loadMorePageSize: options.loadMorePageSize,
      });
    }, [requestedQuery, options]);

    const trackedQuery = useQuery<Q>(initialStoreQuery.id);
    const storeQuery = trackedQuery || initialStoreQuery;
    const {query, promise, error, recordVersions} = storeQuery;
    const {refreshSpec, refreshCount, refresh} = storeQuery;
    const {loadMorePromise, loadMoreError, loadMore} = storeQuery;

    useEffect(() => {
      storeQuery.isDisplayed = true;
    }, [storeQuery]);

    const records = useMemo((): Result => {
      if (!recordVersions) {
        return [];
      }

      return recordVersions.map(v => versions[v]! as Q);
    }, [recordVersions, versions]);

    const lastQueryRef = useRef<StoreQuery<T, Q>>(undefined);
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
    // Refresh.
    //

    useEffect(() => {
      if (!refreshSpec || refreshCount === 0) {
        return;
      }

      return abortable(async abort => {
        await Async.delay(refreshSpec.interval, abort);
        refresh(refreshCount);
      });
    }, [refreshSpec, refreshCount, refresh]);

    //
    // Context.
    //

    return {
      isLoading: Boolean(promise) && refreshCount === 0,
      isRefreshing: Boolean(promise) && refreshCount > 0,
      error,
      isLoadingMore: Boolean(loadMorePromise),
      loadMoreError,
      loadMore,
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
    options: UseRecordQueryOptions = {}
  ) {
    // TODO: Use nextPage info instead of requesting 2.
    const queryResult = useRecordsQuery(
      {...requestedQuery, pageSize: 2},
      options
    );
    return useRecordQueryBase(queryResult);
  }

  function useStaticRecordQuery<Q extends T>(
    requestedQuery: Query<Q>,
    {refreshIntervalSeconds}: UseStaticRecordQueryOptions = {}
  ) {
    const options: UseStaticRecordsQueryOptions | undefined =
      refreshIntervalSeconds
        ? {refreshMode: "full", refreshIntervalSeconds}
        : undefined;

    const queryResult = useStaticRecordsQuery(
      {...requestedQuery, pageSize: 2},
      options
    );
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

function findLiveQueryMatch<T extends AnyRecord, Q extends T>(
  liveQueries: QueriesList<T>,
  query: StoreQuery<T, Q>
) {
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
}
