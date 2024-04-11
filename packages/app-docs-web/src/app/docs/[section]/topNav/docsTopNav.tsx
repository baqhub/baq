"use client";

import {ButtonRow, tw} from "@baqhub/ui/core/style.js";
import {Bars3BottomLeftIcon, ChevronRightIcon} from "@heroicons/react/20/solid";
import {FC, MouseEvent, useCallback, useState} from "react";
import {MdxHeader} from "../../../../helpers/mdxHelpers.js";
import {DocsSubSectionLight} from "../../../../services/docs.js";
import {DocsTopNavLeftMenu} from "./docsTopNavLeftMenu.jsx";
import {DocsTopNavRightMenu} from "./docsTopNavRightMenu.jsx";

//
// Props.
//

interface DocsTopNavProps {
  section: string;
  subSections: ReadonlyArray<DocsSubSectionLight>;
  headers: ReadonlyArray<MdxHeader>;
}

//
// Style.
//

const Layout = tw.div`
  lg:hidden
  sticky
  z-10
  top-0

  flex
  flex-row

  py-1.5
  px-4
  sm:px-6

  border-b
  border-zinc-200
  dark:border-zinc-950

  bg-white
  dark:bg-zinc-800
`;

const NavButton = tw(ButtonRow)`
  py-1.5
  px-2
  gap-2
  items-center

  text-sm
  font-medium
  text-zinc-600
  dark:text-zinc-300
  hover:text-amber-800
  dark:hover:text-amber-400
  select-none

  rounded-md
`;

const navButtonActive = `
  text-amber-700
  dark:text-amber-500
`;

const NavButtonRight = tw(NavButton)`
  gap-1
`;

const NavButtonIcon = tw.div`
  w-5
  h-5
`;

const NavButtonIconRight = tw(NavButtonIcon)`
  -mr-1.5
`;

const Spacer = tw.div`
  grow
`;

//
// Component.
//

export const DocsTopNav: FC<DocsTopNavProps> = props => {
  const {section, subSections, headers} = props;
  const hasHeaders = headers.length > 0;
  const [isLeftMenuOpen, setIsLeftMenuOpen] = useState(false);
  const [rightMenuTop, setRightMenuTop] = useState<number>();
  const isRightMenuOpen = rightMenuTop !== undefined;

  const toggleLeftMenu = useCallback(() => {
    setIsLeftMenuOpen(value => !value);
  }, []);

  const onNavButtonRightClick = (e: MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setRightMenuTop(rect.bottom);
  };

  const onMenuRightRequestClose = () => {
    setRightMenuTop(undefined);
  };

  return (
    <Layout>
      <NavButton onClick={toggleLeftMenu}>
        <NavButtonIcon>
          <Bars3BottomLeftIcon />
        </NavButtonIcon>
        Menu
      </NavButton>
      <Spacer />
      {hasHeaders && (
        <NavButtonRight
          onClick={onNavButtonRightClick}
          className={isRightMenuOpen ? navButtonActive : undefined}
        >
          On this page
          <NavButtonIconRight
            className={isRightMenuOpen ? "rotate-90" : undefined}
          >
            <ChevronRightIcon />
          </NavButtonIconRight>
        </NavButtonRight>
      )}
      {isLeftMenuOpen && (
        <DocsTopNavLeftMenu
          section={section}
          subSections={subSections}
          onRequestClose={toggleLeftMenu}
        />
      )}
      {rightMenuTop !== undefined && (
        <DocsTopNavRightMenu
          top={rightMenuTop}
          headers={headers}
          onRequestClose={onMenuRightRequestClose}
        />
      )}
    </Layout>
  );
};
