import {FC, useState} from "react";
import {TopNavBase} from "./topNavBase.js";

//
// Component.
//

export const PublicTopNav: FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  return (
    <TopNavBase
      isSearchOpen={isSearchOpen}
      onSearchClick={() => setIsSearchOpen(true)}
      onSearchRequestClose={() => setIsSearchOpen(false)}
    />
  );
};
