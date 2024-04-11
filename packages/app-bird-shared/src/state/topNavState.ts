import {useCallback, useState} from "react";
import {useRecordHelpers} from "../baq/store.js";

export function useTopNavState() {
  const {entity} = useRecordHelpers();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const onSearchClick = useCallback(() => {
    setIsSearchOpen(true);
  }, []);

  const onSearchRequestClose = useCallback(() => {
    setIsSearchOpen(false);
  }, []);

  return {
    entity,
    isSearchOpen,
    onSearchClick,
    onSearchRequestClose,
  };
}
