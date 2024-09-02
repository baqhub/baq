import {FC, PropsWithChildren} from "react";
import {findPagePath} from "../../../services/pages.js";
import {ClientLink} from "../clientLink.jsx";
import {isServerRendering} from "../serverRender.js";
import {MdxA} from "./mdx.jsx";

//
// Props.
//

interface MdxLinkProps extends PropsWithChildren {
  href: string | undefined;
}

//
// Component.
//

export const MdxLink: FC<MdxLinkProps> = props => {
  const {href, children} = props;

  if (!href) {
    return children;
  }

  const pagePath = findPagePath(href);
  const isStatic = isServerRendering();

  if (pagePath && !isStatic) {
    return (
      <ClientLink href={pagePath} passHref legacyBehavior>
        <MdxA>{children}&shy;</MdxA>
      </ClientLink>
    );
  }

  if (href.startsWith("/") && !isStatic) {
    return (
      <ClientLink href={href} passHref legacyBehavior>
        <MdxA>{children}&shy;</MdxA>
      </ClientLink>
    );
  }

  const isExternal = href.startsWith("http");
  const target = isExternal ? "_blank" : undefined;

  return (
    <MdxA href={href} target={target}>
      {children}&shy;
    </MdxA>
  );
};
