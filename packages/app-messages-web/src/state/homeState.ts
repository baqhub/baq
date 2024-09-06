import {HandlerOf, Q, Query} from "@baqhub/sdk";
import {useCallback, useState} from "react";
import {ConversationRecordKey} from "../baq/conversationRecord.js";
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
  //
  // Sync query.
  //

  // TODO: Improve to account for most recent message.
  useRecordQuery(
    {
      filter: Q.type(MessageRecord),
      sources: [...Query.defaultSources, "notification_unknown"],
    },
    {mode: "sync"}
  );

  //
  // Selected conversation.
  //

  const [selectedKey, setSelectedKey] = useState<ConversationRecordKey>();
  const selectedRecord = useFindRecordByKey(selectedKey);
  const verifiedSelectedKey = selectedRecord ? selectedKey : undefined;

  const onConversationSelect = useCallback<ConversationSelectHandler>(
    selectedKey => setSelectedKey(selectedKey),
    []
  );

  return {
    selectedKey: verifiedSelectedKey,
    onConversationSelect,
  };
}
