import {
  AbortedError,
  AnyRecord,
  AppRecord,
  AppRecordContent,
  AppScopes,
  Authentication,
  AuthenticationState,
  Client,
  EntityRecord,
  Http,
  HttpStatusCode,
  RequestError,
  unreachable,
} from "@baqhub/sdk";
import isEqual from "lodash/isEqual.js";
import {useCallback, useEffect, useMemo, useReducer} from "react";
import {abortable} from "../helpers/hooks.js";
import {InvalidActionError} from "../helpers/stateErrors.js";
import {
  AuthenticationStorage,
  SecureStorageAdapter,
  StorageAdapter,
} from "../helpers/storage.js";
import {buildFetcher} from "../helpers/suspense.js";
import {StoreIdentity} from "./store/store.js";

//
// State.
//

export enum AuthenticationStatus {
  UNAUTHENTICATED = "unauthenticated",
  AUTHENTICATED = "authenticated",
}

export enum ConnectStatus {
  IDLE = "idle",
  CONNECTING = "connecting",
  WAITING_ON_FLOW = "waiting_on_flow",
}

export enum ConnectError {
  ENTITY_NOT_FOUND = "entity_not_found",
  BAD_APP_RECORD = "bad_app_record",
  OTHER = "other",
}

interface UnauthenticatedInitialState {
  status: AuthenticationStatus.UNAUTHENTICATED;
  connectStatus: ConnectStatus.IDLE;
  error?: ConnectError;
}

interface UnauthenticatedConnectingState {
  status: AuthenticationStatus.UNAUTHENTICATED;
  connectStatus: ConnectStatus.CONNECTING;
  entity: string;
}

interface UnauthenticatedWaitingOnFlowState {
  status: AuthenticationStatus.UNAUTHENTICATED;
  connectStatus: ConnectStatus.WAITING_ON_FLOW;
  localState: AuthenticationState;
  flowUrl: string;
}

export type UnauthenticatedState =
  | UnauthenticatedInitialState
  | UnauthenticatedConnectingState
  | UnauthenticatedWaitingOnFlowState;

interface InitializingAuthenticatedState {
  status: AuthenticationStatus.AUTHENTICATED;
  authorizationId: string | undefined;
  localState: AuthenticationState;
  identity: StoreIdentity;
}

interface InitializedAuthenticatedState {
  status: AuthenticationStatus.AUTHENTICATED;
  identity: StoreIdentity;
}

type AuthenticatedState =
  | InitializingAuthenticatedState
  | InitializedAuthenticatedState;

export type UseAuthenticationState = UnauthenticatedState | AuthenticatedState;

//
// Actions.
//

enum UseAuthenticationActionType {
  INITIALIZE_SUCCESS = "INITIALIZE_SUCCESS",
  CONNECT_START = "CONNECT_START",
  CONNECT_SUCCESS = "CONNECT_SUCCESS",
  CONNECT_FAILURE = "CONNECT_FAILURE",
  AUTHORIZATION_SUCCESS = "AUTHORIZATION_SUCCESS",
  AUTHORIZATION_FAILURE = "AUTHORIZATION_FAILURE",
  DISCONNECT = "DISCONNECT",
}

interface InitializeSuccessAction {
  type: UseAuthenticationActionType.INITIALIZE_SUCCESS;
  identity: StoreIdentity | undefined;
}

interface ConnectStartAction {
  type: UseAuthenticationActionType.CONNECT_START;
  entity: string;
}

interface ConnectSuccessAction {
  type: UseAuthenticationActionType.CONNECT_SUCCESS;
  flowUrl: string;
  localState: AuthenticationState;
}

interface ConnectFailureAction {
  type: UseAuthenticationActionType.CONNECT_FAILURE;
  error: ConnectError;
}

interface AuthorizationSuccessAction {
  type: UseAuthenticationActionType.AUTHORIZATION_SUCCESS;
  authorizationId: string;
  identity: StoreIdentity;
}

interface AuthorizationFailureAction {
  type: UseAuthenticationActionType.AUTHORIZATION_FAILURE;
}

interface DisconnectAction {
  type: UseAuthenticationActionType.DISCONNECT;
}

type UseAuthenticationAction =
  | InitializeSuccessAction
  | ConnectStartAction
  | ConnectSuccessAction
  | ConnectFailureAction
  | AuthorizationSuccessAction
  | AuthorizationFailureAction
  | DisconnectAction;

//
// Reducer.
//

function reducer(
  state: UseAuthenticationState,
  action: UseAuthenticationAction
): UseAuthenticationState {
  switch (action.type) {
    case UseAuthenticationActionType.INITIALIZE_SUCCESS:
      if (
        state.status !== AuthenticationStatus.AUTHENTICATED ||
        !("localState" in state)
      ) {
        throw new InvalidActionError(state, action);
      }

      return {
        status: AuthenticationStatus.AUTHENTICATED,
        identity: action.identity || state.identity,
      };

    case UseAuthenticationActionType.CONNECT_START:
      if (
        state.status !== AuthenticationStatus.UNAUTHENTICATED ||
        state.connectStatus !== ConnectStatus.IDLE
      ) {
        throw new InvalidActionError(state, action);
      }

      return {
        status: AuthenticationStatus.UNAUTHENTICATED,
        connectStatus: ConnectStatus.CONNECTING,
        entity: action.entity,
      };

    case UseAuthenticationActionType.CONNECT_SUCCESS:
      if (
        state.status !== AuthenticationStatus.UNAUTHENTICATED ||
        state.connectStatus !== ConnectStatus.CONNECTING
      ) {
        throw new InvalidActionError(state, action);
      }

      return {
        status: AuthenticationStatus.UNAUTHENTICATED,
        connectStatus: ConnectStatus.WAITING_ON_FLOW,
        flowUrl: action.flowUrl,
        localState: action.localState,
      };

    case UseAuthenticationActionType.CONNECT_FAILURE:
      if (
        state.status !== AuthenticationStatus.UNAUTHENTICATED ||
        state.connectStatus !== ConnectStatus.CONNECTING
      ) {
        throw new InvalidActionError(state, action);
      }

      return {
        status: AuthenticationStatus.UNAUTHENTICATED,
        connectStatus: ConnectStatus.IDLE,
        error: action.error,
      };

    case UseAuthenticationActionType.AUTHORIZATION_SUCCESS:
      if (
        state.status !== AuthenticationStatus.UNAUTHENTICATED ||
        state.connectStatus !== ConnectStatus.WAITING_ON_FLOW
      ) {
        throw new InvalidActionError(state, action);
      }

      return {
        status: AuthenticationStatus.AUTHENTICATED,
        localState: state.localState,
        authorizationId: action.authorizationId,
        identity: action.identity,
      };

    case UseAuthenticationActionType.AUTHORIZATION_FAILURE:
      if (
        state.status !== AuthenticationStatus.UNAUTHENTICATED ||
        state.connectStatus !== ConnectStatus.WAITING_ON_FLOW
      ) {
        throw new InvalidActionError(state, action);
      }

      return {
        status: AuthenticationStatus.UNAUTHENTICATED,
        connectStatus: ConnectStatus.IDLE,
      };

    case UseAuthenticationActionType.DISCONNECT:
      if (state.status !== AuthenticationStatus.AUTHENTICATED) {
        throw new InvalidActionError(state, action);
      }

      return {
        status: AuthenticationStatus.UNAUTHENTICATED,
        connectStatus: ConnectStatus.IDLE,
      };

    default:
      unreachable(action);
  }
}

//
// Hook.
//

export interface BuildAuthenticationOptions {
  storage: StorageAdapter;
  secureStorage?: SecureStorageAdapter;
  app: AppRecordContent;
}

export interface UseAuthenticationOptions {
  appIconUrl?: string;
  authorizationId?: string | null;
}

export function buildAuthentication(options: BuildAuthenticationOptions) {
  const {storage, secureStorage, app} = options;
  const authenticationStorage = new AuthenticationStorage(
    storage,
    secureStorage
  );

  const findLocalState = buildFetcher(async () => {
    return authenticationStorage.read();
  });

  function buildInitialState(
    newAuthorizationId: string | undefined
  ): UseAuthenticationState {
    const localState = findLocalState();
    if (!localState) {
      return {
        status: AuthenticationStatus.UNAUTHENTICATED,
        connectStatus: ConnectStatus.IDLE,
      };
    }

    const authorizationId = newAuthorizationId || localState.authorizationId;
    if (!authorizationId) {
      return {
        status: AuthenticationStatus.UNAUTHENTICATED,
        connectStatus: ConnectStatus.IDLE,
      };
    }

    const localStateWithAuthorization = Authentication.complete(
      localState,
      authorizationId
    );

    const client = Client.authenticated(localStateWithAuthorization);
    const blobUrlBuilder = client.blobUrlBuilderFor(localState.entityRecord);
    return {
      status: AuthenticationStatus.AUTHENTICATED,
      authorizationId,
      localState,
      identity: {
        entityRecord: localState.entityRecord,
        client,
        blobUrlBuilder,
      },
    };
  }

  function useAuthentication(options: UseAuthenticationOptions = {}) {
    const {appIconUrl, authorizationId} = options;
    const [authenticationState, dispatch] = useReducer(
      reducer,
      authorizationId || undefined,
      buildInitialState
    );

    //
    // API.
    //

    const onConnectRequest = useCallback((entity: string) => {
      dispatch({
        type: UseAuthenticationActionType.CONNECT_START,
        entity,
      });
    }, []);

    const waitingOnFlowLocalState =
      authenticationState.status === AuthenticationStatus.UNAUTHENTICATED &&
      authenticationState.connectStatus === ConnectStatus.WAITING_ON_FLOW &&
      authenticationState;

    const onAuthorizationResult = useCallback(
      (authorizationId?: string) => {
        if (!waitingOnFlowLocalState) {
          throw new Error("Authentication not waiting on flow.");
        }

        if (!authorizationId) {
          dispatch({type: UseAuthenticationActionType.AUTHORIZATION_FAILURE});
          return;
        }

        const {localState} = waitingOnFlowLocalState;
        const localStateWithAuthorization: AuthenticationState = {
          ...localState,
          authorizationId: authorizationId || localState.authorizationId,
        };

        const client = Client.authenticated(localStateWithAuthorization);
        const blobUrlBuilder = client.blobUrlBuilderFor(
          localState.entityRecord
        );

        dispatch({
          type: UseAuthenticationActionType.AUTHORIZATION_SUCCESS,
          authorizationId,
          identity: {
            entityRecord: localState.entityRecord,
            client,
            blobUrlBuilder,
          },
        });
      },
      [waitingOnFlowLocalState]
    );

    const onDisconnectRequest = useCallback(() => {
      dispatch({type: UseAuthenticationActionType.DISCONNECT});
    }, []);

    //
    // Clear local state.
    //

    const unauthenticatedLocalState =
      authenticationState.status === AuthenticationStatus.UNAUTHENTICATED &&
      authenticationState.connectStatus === ConnectStatus.IDLE &&
      authenticationState;

    useEffect(() => {
      if (!unauthenticatedLocalState) {
        return;
      }

      authenticationStorage.write(undefined);
    }, [unauthenticatedLocalState]);

    //
    // Initialization.
    //

    const initializingLocalState =
      authenticationState.status === AuthenticationStatus.AUTHENTICATED &&
      "localState" in authenticationState &&
      authenticationState;

    useEffect(() => {
      if (!initializingLocalState) {
        return;
      }

      const {authorizationId, localState, identity} = initializingLocalState;
      const {client} = identity;

      return abortable(async signal => {
        try {
          const [serverEntityRecord, serverAppRecord] = await Promise.all([
            client.getOwnRecord(
              AnyRecord,
              EntityRecord,
              localState.entityRecord.id,
              {signal}
            ),
            client.getOwnRecord(AnyRecord, AppRecord, localState.appRecord.id, {
              signal,
            }),
          ]);

          const updatedState: AuthenticationState = {
            ...localState,
            authorizationId,
            entityRecord: serverEntityRecord.record,
            appRecord: serverAppRecord.record,
          };

          // Check compatibility of app record scopes with what we require.
          if (!AppScopes.hasScopes(updatedState.appRecord, app.scopeRequest)) {
            dispatch({type: UseAuthenticationActionType.DISCONNECT});
            return;
          }

          const authorizationIdChanged =
            updatedState.authorizationId !== localState.authorizationId;
          const recordsChanged =
            !isEqual(updatedState.entityRecord, serverEntityRecord.record) ||
            !isEqual(updatedState.appRecord, serverAppRecord.record);

          if (authorizationIdChanged || recordsChanged) {
            await authenticationStorage.write(updatedState);
          }

          if (!recordsChanged) {
            dispatch({
              type: UseAuthenticationActionType.INITIALIZE_SUCCESS,
              identity: undefined,
            });
            return;
          }

          await authenticationStorage.write(updatedState);

          const updatedClient = Client.authenticated(updatedState);
          const blobUrlBuilder = await updatedClient.blobUrlBuilder();

          dispatch({
            type: UseAuthenticationActionType.INITIALIZE_SUCCESS,
            identity: {
              entityRecord: serverEntityRecord.record,
              client: updatedClient,
              blobUrlBuilder,
            },
          });
        } catch (error) {
          if (error instanceof AbortedError || signal.aborted) {
            return;
          }

          if (
            error instanceof RequestError &&
            [
              HttpStatusCode.NOT_FOUND,
              HttpStatusCode.FORBIDDEN,
              HttpStatusCode.UNAUTHORIZED,
            ].includes(error.status)
          ) {
            dispatch({type: UseAuthenticationActionType.DISCONNECT});
            return;
          }

          throw error;
        }
      });
    }, [initializingLocalState]);

    //
    // Connection.
    //

    const appIconPromise = useMemo(() => {
      if (!appIconUrl) {
        return undefined;
      }

      if (authenticationState.status !== AuthenticationStatus.UNAUTHENTICATED) {
        return undefined;
      }

      return Http.download(appIconUrl).then(([_, b]) => b);
    }, [appIconUrl, authenticationState.status]);

    const connectingState =
      authenticationState.status === AuthenticationStatus.UNAUTHENTICATED &&
      authenticationState.connectStatus === ConnectStatus.CONNECTING &&
      authenticationState;

    useEffect(() => {
      if (!connectingState) {
        return;
      }

      console.log("Starting auth.");
      const {entity} = connectingState;

      return abortable(async signal => {
        try {
          const icon = await appIconPromise;
          const auth = await Authentication.register(entity, app, {
            icon,
            signal,
          });
          const {flowUrl, state} = auth;

          // Save the local state.
          await authenticationStorage.write(state);

          // Hand it off to the authentication flow.
          dispatch({
            type: UseAuthenticationActionType.CONNECT_SUCCESS,
            flowUrl,
            localState: state,
          });
        } catch (error) {
          if (error instanceof AbortedError || signal.aborted) {
            return;
          }

          console.log("Sign-in error:", error);
          dispatch({
            type: UseAuthenticationActionType.CONNECT_FAILURE,
            error: ConnectError.OTHER,
          });
        }
      });
    }, [appIconPromise, connectingState]);

    return {
      state: authenticationState,
      onConnectRequest,
      onAuthorizationResult,
      onDisconnectRequest,
    };
  }

  return {useAuthentication};
}
