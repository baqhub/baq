import {Handler} from "@baqhub/sdk";
import {Column, Row} from "@baqhub/ui/core/style.js";
import {MagnifyingGlassIcon} from "@heroicons/react/24/outline";
import {Link, useLocation, useNavigate} from "@tanstack/react-router";
import {PropsWithChildren, useCallback, type FC} from "react";
import tiwi from "tiwi";
import {SearchDialog} from "./searchDialog.js";
import {TopNavItem} from "./topNavItem.js";

//
// Props.
//

interface TopNavBaseProps extends PropsWithChildren {
  isSearchOpen: boolean;
  onSearchClick: Handler;
  onSearchRequestClose: Handler;
}

//
// Style.
//

const Layout = tiwi(Column)`
  fixed
  w-full
  h-[calc(4rem_+_1px)]
  items-center

  backdrop-blur-md
  bg-white/30
  dark:bg-neutral-900/90
`;

const Center = tiwi(Row)`
  w-full
  max-w-screen-sm
  h-16

  px-3
  sm:px-5
  items-center
  gap-2
`;

const TitleLink = tiwi(Link)`
  py-1
  px-3

  text-lg
  font-semibold
  select-none

  text-neutral-900
  hover:text-amber-800
  active:text-amber-700
  dark:text-white
  dark:hover:text-amber-400
  dark:active:text-amber-500
` as typeof Link;

const TitleText = tiwi.div`
  py-1
  px-3

  text-lg
  font-semibold
  select-none

  text-neutral-900
  dark:text-white
`;

const Items = tiwi(Row)`
  px-0.5
  gap-2
`;

const Spacer = tiwi.div`
  grow
`;

//
// Component.
//

export const TopNavBase: FC<TopNavBaseProps> = props => {
  const {isSearchOpen, onSearchClick, onSearchRequestClose, children} = props;

  const {pathname} = useLocation();
  const navigate = useNavigate();
  const onEntityFound = useCallback(
    (entity: string) => {
      navigate({to: "/profile/$entity", params: {entity}});
    },
    [navigate]
  );

  return (
    <>
      <Layout>
        <Center>
          {pathname === "/" ? (
            <TitleText>Bird</TitleText>
          ) : (
            <TitleLink to="/">Bird</TitleLink>
          )}
          <Spacer />
          <Items>
            <TopNavItem onClick={onSearchClick}>
              <MagnifyingGlassIcon className="stroke-2" />
            </TopNavItem>
            {children}
          </Items>
        </Center>
      </Layout>
      {isSearchOpen && (
        <SearchDialog
          onEntityFound={onEntityFound}
          onRequestClose={onSearchRequestClose}
        />
      )}
    </>
  );
};
