import {AbortedError, HandlerOf, unreachable} from "@baqhub/sdk";
import {InvalidActionError, abortable} from "@baqhub/sdk-react";
import {useCallback, useEffect, useReducer} from "react";
import {useRecordHelpers} from "../baq/store.js";

//
// Model.
//

export enum SearchDialogError {
  ENTITY_RECORD_NOT_FOUND = "entity_record_not_found",
  OTHER = "other",
}

interface EditingSearchDialogState {
  isResolving: false;
  searchEntity: string;
  error?: SearchDialogError;
}

interface ResolvingSearchDialogState {
  isResolving: true;
  searchEntity: string;
}

export type SearchDialogState =
  | EditingSearchDialogState
  | ResolvingSearchDialogState;

//
// Actions.
//

export enum SearchDialogActionType {
  SEARCH_ENTITY_CHANGE = "search_entity_change",
  RESOLUTION_REQUEST = "resolution_request",
  RESOLUTION_ERROR = "resolution_error",
}

interface SearchEntityChangeAction {
  type: SearchDialogActionType.SEARCH_ENTITY_CHANGE;
  searchEntity: string;
}

interface ResolutionRequestAction {
  type: SearchDialogActionType.RESOLUTION_REQUEST;
}

interface ResolutionErrorAction {
  type: SearchDialogActionType.RESOLUTION_ERROR;
  error: SearchDialogError;
}

type SearchDialogAction =
  | SearchEntityChangeAction
  | ResolutionRequestAction
  | ResolutionErrorAction;

//
// Reducer.
//

export function reducer(
  state: SearchDialogState,
  action: SearchDialogAction
): SearchDialogState {
  switch (action.type) {
    case SearchDialogActionType.SEARCH_ENTITY_CHANGE:
      if (!state || state.isResolving) {
        throw new InvalidActionError(state, action);
      }

      return {
        ...state,
        searchEntity: action.searchEntity,
      };

    case SearchDialogActionType.RESOLUTION_REQUEST:
      if (!state || state.isResolving) {
        throw new InvalidActionError(state, action);
      }

      return {
        isResolving: true,
        searchEntity: state.searchEntity,
      };

    case SearchDialogActionType.RESOLUTION_ERROR:
      if (!state || !state.isResolving) {
        throw new InvalidActionError(state, action);
      }

      return {
        isResolving: false,
        searchEntity: state.searchEntity,
        error: action.error,
      };

    default:
      return unreachable(action);
  }
}

export function useSearchDialogState(onEntityFound: HandlerOf<string>) {
  const {entity, discover, updateRecords} = useRecordHelpers();
  const [state, dispatch] = useReducer(reducer, {
    isResolving: false,
    searchEntity: "",
  });

  const onEntityChange = useCallback((searchEntity: string) => {
    dispatch({
      type: SearchDialogActionType.SEARCH_ENTITY_CHANGE,
      searchEntity,
    });
  }, []);

  const onResolutionRequest = useCallback(() => {
    dispatch({
      type: SearchDialogActionType.RESOLUTION_REQUEST,
    });
  }, []);

  const onError = useCallback((error: SearchDialogError) => {
    dispatch({
      type: SearchDialogActionType.RESOLUTION_ERROR,
      error,
    });
  }, []);

  const {isResolving, searchEntity} = state;
  useEffect(() => {
    if (!isResolving) {
      return;
    }

    return abortable(async signal => {
      try {
        const fullEntity = searchEntity.includes(".")
          ? searchEntity
          : `${searchEntity}.baq.run`;

        // Resolve the recipient.
        const entityRecord = await discover(fullEntity, signal);

        // Update the state.
        updateRecords([entityRecord], entityRecord.author.entity);
        onEntityFound(entityRecord.author.entity);
      } catch (error) {
        if (error instanceof AbortedError) {
          return;
        }

        onError(SearchDialogError.OTHER);
      }
    });
  }, [
    entity,
    discover,
    isResolving,
    searchEntity,
    updateRecords,
    onEntityFound,
    onError,
  ]);

  return {
    isResolving,
    entity: searchEntity,
    onEntityChange,
    onResolutionRequest,
  };
}
