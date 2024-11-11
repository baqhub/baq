"use client";

import {ButtonRow} from "@baqhub/ui/core/style.jsx";
import {Bars3BottomLeftIcon, ChevronRightIcon} from "@heroicons/react/20/solid";
import {FC, MouseEvent, useCallback, useState} from "react";
import tiwi from "tiwi";
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

const Layout = tiwi.div`
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

const NavButton = tiwi(ButtonRow)`
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

const NavButtonRight = tiwi(NavButton)`
  gap-1
`;

const NavButtonIcon = tiwi.div`
  w-5
  h-5
`;

const NavButtonIconRight = tiwi(NavButtonIcon)`
  -mr-1.5
`;

const Spacer = tiwi.div`
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
