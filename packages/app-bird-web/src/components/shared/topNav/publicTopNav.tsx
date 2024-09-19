import {FC, useCallback, useState} from "react";
import {TopNavBase} from "./topNavBase.js";

//
// Component.
//

export const PublicTopNav: FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const onSearchClick = useCallback(() => {
    setIsSearchOpen(true);
  }, []);

  const onSearchRequestClose = useCallback(() => {
    setIsSearchOpen(false);
  }, []);

  return (
    <TopNavBase
      isSearchOpen={isSearchOpen}
      onSearchClick={onSearchClick}
      onSearchRequestClose={onSearchRequestClose}
    />
  );
};
