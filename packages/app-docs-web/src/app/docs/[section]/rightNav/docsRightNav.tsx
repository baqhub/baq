"use client";

import {tw} from "@baqhub/ui/core/style.jsx";
import {
  FC,
  Fragment,
  MouseEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {MdxHeader} from "../../../../helpers/mdxHelpers.js";
import {Text} from "../../../global/style.jsx";
import {DocsRightNavSubscribe} from "./docsRightNavSubscribe.jsx";

//
// Props.
//

interface DocsRightNavProps {
  headers: ReadonlyArray<MdxHeader>;
}

//
// Style.
//

const Layout = tw.div`
  relative
  hidden
  xl:block

  pointer-events-none
  shrink-0
  w-80
`;

const Content = tw.div`
  fixed
  top-[calc(4rem_+_1px)]
  bottom-0

  flex
  flex-col
  w-80
  items-start

  gap-8
  py-8
  overflow-y-auto
  pointer-events-auto
`;

const Menu = tw.div`
  relative

  flex
  flex-col

  px-5
  py-1
  gap-2.5

  border-l
  border-zinc-200
  dark:border-zinc-700
`;

const ActiveIndicator = tw.div`
  absolute
  top-0
  -left-px
  my-[3px]
  w-px
  h-6

  bg-amber-600
  dark:bg-amber-500

  transition-transform
`;

const SubMenu = tw.div`
  flex
  flex-col
  pl-2
  gap-2.5
`;

const MenuTitle = tw(Text)`
  text-sm
  font-semibold
`;

const MenuLink = tw.a`
  text-sm
  font-medium
  text-zinc-500
  dark:text-zinc-400
  hover:text-zinc-900
  dark:hover:text-zinc-200

  transition-colors
  duration-100

  [&_code]:text-xs
`;

const activeMenuLink = `
  text-zinc-900
  dark:text-zinc-200
`;

//
// Component.
//

interface ActiveLinkState {
  header: MdxHeader;
  top: number;
}

export const DocsRightNav: FC<DocsRightNavProps> = ({headers}) => {
  //
  // Link refs.
  //

  const contentRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const overviewRef = useRef<HTMLAnchorElement>(null);
  const linkRefs = useRef(new Map<string, HTMLAnchorElement>());
  const onRef = (header: MdxHeader, node: HTMLAnchorElement | null) => {
    if (!node) {
      linkRefs.current.delete(header.slug);
    } else {
      linkRefs.current.set(header.slug, node);
    }
  };

  //
  // Intersection logic.
  //

  const flatHeaders = useMemo(() => {
    const flattenHeader = (header: MdxHeader): ReadonlyArray<MdxHeader> => {
      return [header, ...header.subHeaders.flatMap(flattenHeader)];
    };

    return headers.flatMap(flattenHeader);
  }, [headers]);

  const [activeLink, setActiveLink] = useState<ActiveLinkState>();
  const activeHeader = activeLink?.header;
  const lockScrollRef = useRef<number>(0);

  useEffect(() => {
    const headerState = new Map<string, boolean>();

    const onIntersectionChange: IntersectionObserverCallback = entries => {
      entries.forEach(e =>
        headerState.set(
          e.target.id,
          !e.isIntersecting && e.boundingClientRect.y < 100
        )
      );

      if (lockScrollRef.current) {
        return;
      }

      const newActiveHeader = flatHeaders.findLast(e =>
        headerState.get(e.slug)
      );

      if (!newActiveHeader) {
        setActiveLink(undefined);
        return;
      }

      const currentMenuRef = menuRef.current;
      const linkRef = linkRefs.current.get(newActiveHeader.slug);

      if (!currentMenuRef || !linkRef) {
        return;
      }

      const top =
        linkRef.getBoundingClientRect().y -
        currentMenuRef.getBoundingClientRect().y -
        5;

      setActiveLink({
        header: newActiveHeader,
        top,
      });
    };

    const observer = new IntersectionObserver(onIntersectionChange, {
      rootMargin: "-100px 0px 100000px 0px",
      threshold: 1,
    });

    flatHeaders.forEach(({slug}) => {
      const headerElement = document.getElementById(slug);
      if (!headerElement) {
        return;
      }

      observer.observe(headerElement);
    });

    return () => {
      observer.disconnect();
    };
  }, [flatHeaders]);

  //
  // Scroll logic.
  //

  useEffect(() => {
    const currentContentRef = contentRef.current;
    const currentOverviewRef = overviewRef.current;
    const activeLinkRef =
      (activeHeader && linkRefs.current.get(activeHeader.slug)) ||
      currentOverviewRef;

    if (!currentContentRef || !activeLinkRef) {
      return;
    }

    const contentRect = currentContentRef.getBoundingClientRect();
    const activeLinkRect = activeLinkRef.getBoundingClientRect();

    const topOffset = activeLinkRect.y - contentRect.y;
    if (topOffset < 70) {
      currentContentRef.scroll({
        top: currentContentRef.scrollTop - (70 - topOffset),
        behavior: "smooth",
      });
      return;
    }

    const bottomOffset = contentRect.bottom - activeLinkRect.bottom;
    if (bottomOffset < 70) {
      currentContentRef.scroll({
        top: currentContentRef.scrollTop + (70 - bottomOffset),
        behavior: "smooth",
      });
    }
  }, [activeHeader]);

  const onLinkClick = (e: MouseEvent<HTMLAnchorElement>) => {
    const {href} = e.currentTarget;
    const slug = href.slice(href.indexOf("#") + 1);
    const newActiveHeader = flatHeaders.find(e => e.slug === slug);
    const currentMenuRef = menuRef.current;

    const lockValue = ++lockScrollRef.current;
    setTimeout(() => {
      if (lockScrollRef.current !== lockValue) {
        return;
      }

      lockScrollRef.current = 0;
    }, 100);

    if (!newActiveHeader || !currentMenuRef) {
      setActiveLink(undefined);
      return;
    }

    const top =
      e.currentTarget.getBoundingClientRect().y -
      currentMenuRef.getBoundingClientRect().y -
      5;

    setActiveLink({
      header: newActiveHeader,
      top,
    });
  };

  //
  // Render.
  //

  const renderLink = (header: MdxHeader, index: number) => {
    const subLinks =
      header.subHeaders.length > 0 ? (
        <SubMenu>{renderLinks(header.subHeaders)}</SubMenu>
      ) : undefined;

    return (
      <Fragment key={index}>
        <MenuLink
          href={`#${header.slug}`}
          ref={node => onRef(header, node)}
          className={header === activeLink?.header ? activeMenuLink : undefined}
          dangerouslySetInnerHTML={{__html: header.content}}
          onClick={onLinkClick}
        />
        {subLinks}
      </Fragment>
    );
  };

  const renderLinks = (headers: ReadonlyArray<MdxHeader>) => {
    return headers.map(renderLink);
  };

  const activeIndicatorTop = activeLink ? activeLink.top : 29;

  if (flatHeaders.length === 0) {
    return (
      <Layout>
        <Content>
          <DocsRightNavSubscribe />
        </Content>
      </Layout>
    );
  }

  return (
    <Layout>
      <Content ref={contentRef}>
        <DocsRightNavSubscribe />
        <Menu ref={menuRef}>
          <ActiveIndicator
            style={{transform: `translateY(${activeIndicatorTop}px)`}}
          />
          <MenuTitle>On this page</MenuTitle>
          <MenuLink
            ref={overviewRef}
            href="#overview"
            className={!activeLink ? activeMenuLink : undefined}
            onClick={onLinkClick}
          >
            Overview
          </MenuLink>
          {renderLinks(headers)}
        </Menu>
      </Content>
    </Layout>
  );
};
