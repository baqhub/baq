import {FC, PropsWithChildren} from "react";
import {findPagePath} from "../../../../services/pages.js";
import {ClientLink} from "../../../global/clientLink.jsx";
import {isServerRendering} from "../../../global/serverRender.js";

//
// Props.
//

interface MdxPillProps extends PropsWithChildren {
  href?: string;
}

//
// Style.
//

const baseStyle = `
  px-1
  py-px

  rounded-md
  border

  align-middle
  text-xs
  ligatures-none
  font-mono
  font-semibold
`;

const linkPillStyle = `
  ${baseStyle}

  text-amber-700
  dark:text-amber-500
  border-amber-700
  dark:border-amber-500

  hover:bg-amber-100
  dark:hover:bg-amber-900

  cursor-pointer
`;

const spanPillStyle = `
  ${baseStyle}

  text-zinc-600
  dark:text-zinc-300
  border-zinc-600
  dark:border-zinc-500
`;

//
// Component.
//

export const MdxPill: FC<MdxPillProps> = props => {
  const {href, children} = props;
  const isStatic = isServerRendering();

  if (!href || isStatic) {
    return <span className={spanPillStyle}>{children}</span>;
  }

  const pagePath = findPagePath(href);
  if (pagePath) {
    return (
      <ClientLink href={pagePath} passHref legacyBehavior>
        <a className={linkPillStyle}>{children}</a>
      </ClientLink>
    );
  }

  return (
    <a className={linkPillStyle} href={href}>
      {children}
    </a>
  );
};
