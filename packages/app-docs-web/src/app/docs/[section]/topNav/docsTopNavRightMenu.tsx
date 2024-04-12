import {Column, tw} from "@baqhub/ui/core/style.jsx";
import {FC, Fragment, MouseEvent, useEffect} from "react";
import {MdxHeader} from "../../../../helpers/mdxHelpers.js";

//
// Props.
//

interface DocsTopNavRightMenuProps {
  top: number;
  headers: ReadonlyArray<MdxHeader>;
  onRequestClose: () => void;
}

//
// Style.
//

const Layout = tw(Column)`
  fixed
  left-0
  top-0
  right-0
  bottom-0

  py-3
  px-5

  bg-zinc-900/20
  dark:bg-black/30
`;

const Spacer = tw.div`
  shrink-0
`;

const Menu = tw(Column)`
  shrink
  max-h-[max(70%,_250px)]

  border
  border-zinc-200
  dark:border-white/10

  rounded-lg
  bg-white
  dark:bg-zinc-800
  drop-shadow-md
`;

const Content = tw(Column)`
  p-4
  gap-1
  overflow-y-auto
  overscroll-contain
`;

const SubMenu = tw(Column)`
  pl-2
  gap-1
`;

const MenuLink = tw.a`
  p-1

  text-sm
  font-medium
  text-zinc-600
  dark:text-zinc-300
  hover:text-amber-800
  dark:hover:text-amber-400
  select-none

  [&_code]:text-xs

  transition-colors
  duration-100
`;

//
// Component.
//

export const DocsTopNavRightMenu: FC<DocsTopNavRightMenuProps> = props => {
  const {top, headers, onRequestClose} = props;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const onMenuClick = (e: MouseEvent) => {
    e.stopPropagation();
  };

  const renderLink = (header: MdxHeader, index: number) => {
    const subLinks =
      header.subHeaders.length > 0 ? (
        <SubMenu>{renderLinks(header.subHeaders)}</SubMenu>
      ) : null;

    return (
      <Fragment key={index}>
        <MenuLink
          href={`#${header.slug}`}
          dangerouslySetInnerHTML={{__html: header.content}}
          onClick={onRequestClose}
        />
        {subLinks}
      </Fragment>
    );
  };

  const renderLinks = (headers: ReadonlyArray<MdxHeader>) => {
    return headers.map(renderLink);
  };

  return (
    <Layout onClick={onRequestClose}>
      <Spacer style={{height: top}} />
      <Menu onClick={onMenuClick}>
        <Content>{renderLinks(headers)}</Content>
      </Menu>
    </Layout>
  );
};
