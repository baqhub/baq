import {
  AbortedError,
  HandlerOf,
  Record,
  RecordMode,
  RecordPermissions,
  unreachable,
} from "@baqhub/sdk";
import {InvalidActionError, abortable} from "@baqhub/sdk-react";
import {useCallback, useEffect, useReducer} from "react";
import {
  ConversationRecord,
  ConversationRecordKey,
} from "../baq/conversationRecord.js";
import {useRecordHelpers} from "../baq/store.js";

//
// Model.
//

export enum ComposerError {
  ENTITY_RECORD_NOT_FOUND = "entity_record_not_found",
  OTHER = "other",
}

interface EditingComposerState {
  isResolving: false;
  recipient: string;
  error?: ComposerError;
}

interface ResolvingComposerState {
  isResolving: true;
  recipient: string;
}

export type ComposerState = EditingComposerState | ResolvingComposerState;

//
// Actions.
//

export enum ComposerActionType {
  RECIPIENT_CHANGE = "recipient_change",
  RESOLUTION_REQUEST = "resolution_request",
  RESOLUTION_ERROR = "resolution_error",
}

interface RecipientChangeAction {
  type: ComposerActionType.RECIPIENT_CHANGE;
  recipient: string;
}

interface ResolutionRequestAction {
  type: ComposerActionType.RESOLUTION_REQUEST;
}

interface ResolutionErrorAction {
  type: ComposerActionType.RESOLUTION_ERROR;
  error: ComposerError;
}

type ComposerAction =
  | RecipientChangeAction
  | ResolutionRequestAction
  | ResolutionErrorAction;

//
// Reducer.
//

export function reducer(
  state: ComposerState,
  action: ComposerAction
): ComposerState {
  switch (action.type) {
    case ComposerActionType.RECIPIENT_CHANGE:
      if (!state || state.isResolving) {
        throw new InvalidActionError(state, action);
      }

      return {
        ...state,
        recipient: action.recipient,
      };

    case ComposerActionType.RESOLUTION_REQUEST:
      if (!state || state.isResolving) {
        throw new InvalidActionError(state, action);
      }

      return {
        isResolving: true,
        recipient: state.recipient,
      };

    case ComposerActionType.RESOLUTION_ERROR:
      if (!state || !state.isResolving) {
        throw new InvalidActionError(state, action);
      }

      return {
        isResolving: false,
        recipient: state.recipient,
        error: action.error,
      };

    default:
      return unreachable(action);
  }
}

//
// Hook.
//

export function useComposerState(
  onConversationCreated: HandlerOf<ConversationRecordKey>
) {
  const {entity, discover, updateRecords} = useRecordHelpers();
  const [state, dispatch] = useReducer(reducer, {
    isResolving: false,
    recipient: "",
  });

  const onRecipientChange = useCallback((recipient: string) => {
    dispatch({
      type: ComposerActionType.RECIPIENT_CHANGE,
      recipient,
    });
  }, []);

  const onResolutionRequest = useCallback(() => {
    dispatch({
      type: ComposerActionType.RESOLUTION_REQUEST,
    });
  }, []);

  const onError = useCallback((error: ComposerError) => {
    dispatch({
      type: ComposerActionType.RESOLUTION_ERROR,
      error,
    });
  }, []);

  const {isResolving, recipient} = state;
  useEffect(() => {
    if (!isResolving) {
      return;
    }

    return abortable(async signal => {
      try {
        // Resolve the recipient.
        const entityRecord = await discover(recipient, signal);
        const localEntityRecord = Record.toResolution(entityRecord);

        // Create the conversation.
        const recipients = [entityRecord.author.entity];
        const permissions = RecordPermissions.readonly(entity, recipients);
        const conversationRecord = ConversationRecord.new(
          entity,
          {},
          {permissions, mode: RecordMode.LOCAL}
        );
        const conversationKey = Record.toKey(conversationRecord);

        // Update the state.
        updateRecords([localEntityRecord, conversationRecord]);
        onConversationCreated(conversationKey);
      } catch (error) {
        if (error instanceof AbortedError) {
          return;
        }

        onError(ComposerError.OTHER);
      }
    });
  }, [
    entity,
    discover,
    isResolving,
    recipient,
    updateRecords,
    onConversationCreated,
    onError,
  ]);

  return {
    isResolving,
    recipient,
    onRecipientChange,
    onResolutionRequest,
  };
}
