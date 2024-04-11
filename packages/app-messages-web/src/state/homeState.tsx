import {HandlerOf, Q} from "@baqhub/sdk";
import {useCallback, useState} from "react";
import {
  ConversationRecord,
  ConversationRecordKey,
} from "../baq/conversationRecord.js";
import {MessageRecord} from "../baq/messageRecord.js";
import {useFindRecordByKey, useRecordQuery} from "../baq/store.js";

//
// Model.
//

export type ConversationSelectHandler = HandlerOf<ConversationRecordKey>;

export interface HomeState {
  selectedKey: ConversationRecordKey | undefined;
  isComposerOpen: boolean;
}

//
// Hook.
//

export function useHomeState() {
  const [{selectedKey, isComposerOpen}, setState] = useState<HomeState>({
    selectedKey: undefined,
    isComposerOpen: false,
  });

  const selectedRecord = useFindRecordByKey(selectedKey);
  const verifiedSelectedKey = selectedRecord ? selectedKey : undefined;

  // TODO: Improve to account for most recent message.
  useRecordQuery(
    {filter: Q.or(Q.type(ConversationRecord), Q.type(MessageRecord))},
    {mode: "sync"}
  );

  const onConversationSelect = useCallback<ConversationSelectHandler>(
    selectedKey => setState(value => ({...value, selectedKey})),
    []
  );

  const onComposerRequest = useCallback(
    () => setState(value => ({...value, isComposerOpen: true})),
    []
  );

  const onComposerRequestClose = useCallback(
    () => setState(value => ({...value, isComposerOpen: false})),
    []
  );

  return {
    selectedKey: verifiedSelectedKey,
    isComposerOpen,
    onConversationSelect,
    onComposerRequest,
    onComposerRequestClose,
  };
}
