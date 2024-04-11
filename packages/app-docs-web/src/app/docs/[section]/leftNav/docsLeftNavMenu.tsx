"use client";

import {tw} from "@baqhub/ui/core/style.js";
import {usePathname} from "next/navigation.js";
import {FC, Fragment} from "react";
import {DocsPageLight, DocsSubSectionLight} from "../../../../services/docs.js";
import {Text} from "../../../global/style.js";
import {DocsLeftNavMenuItem} from "./docsLeftNavMenuItem.js";

//
// Props.
//

interface DocsLeftNavMenuProps {
  section: string;
  subSections: ReadonlyArray<DocsSubSectionLight>;
  onLinkClick?: () => void;
}

//
// Style.
//

const Menu = tw.div`
  flex
  flex-col
  px-8
  gap-2
`;

const SubSection = tw.div`
  flex
  flex-col
  py-5
  gap-2.5

  border-t
  first:border-t-0
  border-zinc-200
  dark:border-zinc-700
`;

const SubLinks = tw.div`
  flex
  flex-col
  gap-2.5

  pl-2
`;

const SubSectionTitle = tw(Text)`
  text-sm
  font-semibold
`;

//
// Component.
//

export const DocsLeftNavMenu: FC<DocsLeftNavMenuProps> = props => {
  const {section, subSections, onLinkClick} = props;
  const pn = usePathname();

  const renderPage = (
    sectionIndex: number,
    {path, subPages, title}: DocsPageLight,
    index: number
  ) => {
    const sectionTo = `/docs/${section}`;
    const pathTo = (s: string) => `${sectionTo}/${s}`;
    const to = pathTo(path);
    const otherTo = sectionIndex === 0 && index === 0 && sectionTo;

    const isActive = to === pn || otherTo === pn;
    const isExpanded = isActive || subPages.some(p => pathTo(p.path) === pn);

    const subPagesRender =
      subPages.length > 0 && isExpanded ? (
        <SubLinks>{subPages.map((p, i) => renderPage(-1, p, i))}</SubLinks>
      ) : undefined;

    return (
      <Fragment key={index}>
        <DocsLeftNavMenuItem to={to} isActive={isActive} onClick={onLinkClick}>
          {title}
        </DocsLeftNavMenuItem>
        {subPagesRender}
      </Fragment>
    );
  };

  const renderSubSection = (subSection: DocsSubSectionLight, index: number) => {
    return (
      <SubSection key={index}>
        <SubSectionTitle>{subSection.subSection}</SubSectionTitle>
        {subSection.pages.map((p, i) => renderPage(index, p, i))}
      </SubSection>
    );
  };

  return <Menu>{subSections.map(renderSubSection)}</Menu>;
};
