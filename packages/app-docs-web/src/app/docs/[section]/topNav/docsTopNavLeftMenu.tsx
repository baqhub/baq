"use client";

import {FC, MouseEvent, useEffect} from "react";
import tiwi from "tiwi";
import {DocsSubSectionLight} from "../../../../services/docs.js";
import {DocsLeftNavMenu} from "../leftNav/docsLeftNavMenu.jsx";

//
// Props.
//

interface DocsTopNavLeftMenuProps {
  section: string;
  subSections: ReadonlyArray<DocsSubSectionLight>;
  onRequestClose: () => void;
}

//
// Style.
//

const Layout = tiwi.div`
  fixed
  left-0
  top-0
  right-0
  bottom-0

  bg-zinc-900/50
  dark:bg-black/70
`;

const Content = tiwi.div`
  w-64
  h-full
  pt-3
  pb-8
  overflow-y-auto
  overscroll-contain

  bg-zinc-100
  dark:bg-zinc-900
`;

//
// Components.
//

export const DocsTopNavLeftMenu: FC<DocsTopNavLeftMenuProps> = props => {
  const {section, subSections, onRequestClose} = props;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const onContentClick = (e: MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <Layout onClick={onRequestClose}>
      <Content onClick={onContentClick}>
        <DocsLeftNavMenu
          section={section}
          subSections={subSections}
          onLinkClick={onRequestClose}
        />
      </Content>
    </Layout>
  );
};
