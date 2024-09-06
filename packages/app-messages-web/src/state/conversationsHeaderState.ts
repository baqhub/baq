import {useCallback, useState} from "react";

export function useConversationsHeaderState() {
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  const onComposerRequest = useCallback(() => setIsComposerOpen(true), []);

  const onComposerRequestClose = useCallback(
    () => setIsComposerOpen(false),
    []
  );

  return {
    isComposerOpen,
    onComposerRequest,
    onComposerRequestClose,
  };
}
