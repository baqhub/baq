import {FC, PropsWithChildren} from "react";
import {matchDocPageHref} from "../../../../helpers/docPageHelpers.js";
import {findDocsPageById} from "../../../../services/docs.js";
import {ClientLink} from "../../../global/clientLink.js";
import {isServerRendering} from "../../../global/serverRender.js";
import {MdxA} from "./mdx.js";

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

  const docPageMatch = matchDocPageHref(href);
  const isStatic = isServerRendering();

  if (docPageMatch && !isStatic) {
    const page = findDocsPageById(docPageMatch[1]!);
    const anchor = docPageMatch[2] || "";
    const to = `/docs/${page.section}/${page.path}${anchor}`;

    return (
      <ClientLink href={to} passHref legacyBehavior>
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
