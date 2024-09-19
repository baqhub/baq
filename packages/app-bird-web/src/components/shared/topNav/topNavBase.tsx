import {Handler} from "@baqhub/sdk";
import {Column, Row, Text, tw} from "@baqhub/ui/core/style.js";
import {MagnifyingGlassIcon} from "@heroicons/react/24/outline";
import {Link, useNavigate} from "@tanstack/react-router";
import {PropsWithChildren, useCallback, type FC} from "react";
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

const Layout = tw(Column)`
  fixed
  w-full
  h-[calc(4rem_+_1px)]
  items-center

  backdrop-blur-md
  bg-white/30
  dark:bg-neutral-900/90
`;

const Center = tw(Row)`
  w-full
  max-w-screen-sm
  h-16

  px-3
  sm:px-5
  items-center
  gap-2
`;

const titleLinkStyle = `
  py-1
  px-3
`;

const TitleText = tw(Text)`
  text-lg
  font-semibold
`;

const Items = tw(Row)`
  px-0.5
  gap-2
`;

const Spacer = tw.div`
  grow
`;

//
// Component.
//

export const TopNavBase: FC<TopNavBaseProps> = props => {
  const {isSearchOpen, onSearchClick, onSearchRequestClose, children} = props;

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
          <Link to="/" className={titleLinkStyle}>
            <TitleText>Bird</TitleText>
          </Link>
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
