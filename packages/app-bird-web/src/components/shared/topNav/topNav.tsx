import {useTopNavState} from "@baqhub/bird-shared/state/topNavState.js";
import {AtSymbolIcon} from "@heroicons/react/24/outline";
import {HomeIcon, UserIcon} from "@heroicons/react/24/solid";
import {type FC} from "react";
import {TopNavBase} from "./topNavBase.js";
import {TopNavItemLink} from "./topNavItem.js";

//
// Component.
//

export const TopNav: FC = () => {
  const state = useTopNavState();
  const {entity, isSearchOpen} = state;
  const {onSearchClick, onSearchRequestClose} = state;

  return (
    <TopNavBase
      isSearchOpen={isSearchOpen}
      onSearchClick={onSearchClick}
      onSearchRequestClose={onSearchRequestClose}
    >
      <TopNavItemLink to="/">
        <HomeIcon />
      </TopNavItemLink>
      <TopNavItemLink to="/mentions">
        <AtSymbolIcon className="stroke-2" />
      </TopNavItemLink>
      <TopNavItemLink to="/profile/$entity" params={{entity}}>
        <UserIcon />
      </TopNavItemLink>
    </TopNavBase>
  );
};
