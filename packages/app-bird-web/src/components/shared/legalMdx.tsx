import {Column, tw} from "@baqhub/ui/core/style.js";
import {MDXProvider} from "@mdx-js/react";
import {Link} from "@tanstack/react-router";
import isString from "lodash/isString.js";
import {MDXComponents} from "mdx/types.js";
import {FC, PropsWithChildren} from "react";

//
// MDX Style.
//

const MdxP = tw.p`
  mt-3
  mb-3

  text-neutral-600
  dark:text-neutral-300
  leading-[1.75]
  font-normal
`;

const MdxLink = tw(Link)`
  text-amber-700
  dark:text-amber-500
  underline
  underline-offset-2

  decoration-amber-700/0
  hover:decoration-amber-700
  dark:decoration-amber-500/0
  dark:hover:decoration-amber-500

  cursor-pointer
  transition-colors
  duration-100
` as typeof Link;

const MdxA = tw.a`
  text-amber-700
  dark:text-amber-500
  underline
  underline-offset-2

  decoration-amber-700/0
  hover:decoration-amber-700
  dark:decoration-amber-500/0
  dark:hover:decoration-amber-500

  cursor-pointer
  transition-colors
  duration-100
`;

const MdxH1 = tw.h1`
  mb-6

  text-4xl
  font-bold
  text-neutral-900
  dark:text-white
`;

const MdxH2 = tw.h2`
  mt-8
  mb-5
  pt-6
  [&_+_*]:mt-0

  scroll-mt-48

  border-t
  border-neutral-300
  dark:border-neutral-700

  text-2xl
  font-semibold
  text-neutral-900
  dark:text-white
`;

const MdxH3 = tw.h3`
  mb-4
  pt-6
  [&_+_*]:mt-0

  text-2xl
  font-semibold
  text-neutral-900
  dark:text-white
`;

export const MdxUl = tw.ul`
  mt-1
  mb-1
  pl-6
  [ul_&]:mt-3
  [ul_&]:mb-3

  list-disc
  marker:text-neutral-600
  dark:marker:text-neutral-300
`;

const MdxOl = tw.ol`
  mt-1
  mb-1
  pl-10
  [ol_&]:mt-3
  [ol_&]:mb-3

  list-decimal
  marker:italic
  marker:text-neutral-500
  dark:marker:text-neutral-400
`;

const MdxLi = tw.li`
  mt-1
  mb-1
  [&_li]:mt-1.5
  [&_li]:mb-1.5
  [&_>_p]:mt-3
  [&_>_p]:mb-3
  [&_>_&_>_p]:mt-2
  [&_>_&_>_p]:mb-2

  leading-[1.75]
  text-neutral-600
  dark:text-neutral-300
`;

//
// Component.
//

interface MdxAProps extends PropsWithChildren {
  href: string | undefined;
}

const LegalMdxA: FC<MdxAProps> = props => {
  const {href, children} = props;

  if (href?.startsWith("#")) {
    return <MdxA href={href}>{children}</MdxA>;
  }

  if (href?.startsWith("http")) {
    return (
      <MdxLink to={href} target="_blank">
        {children}
      </MdxLink>
    );
  }

  return <MdxLink to={href}>{children}</MdxLink>;
};

const LegalMdxH2: FC<PropsWithChildren> = ({children}) => {
  if (!isString(children)) {
    throw new Error("Unexpected children.");
  }

  const headerIndex = Number(children.slice(0, children.indexOf(".")));
  if (!Number.isInteger(headerIndex)) {
    return <MdxH2>{children}</MdxH2>;
  }

  return <MdxH2 id={`t${headerIndex}`}>{children}</MdxH2>;
};

const components: MDXComponents = {
  p: MdxP,
  a: ({href, children}) => <LegalMdxA href={href}>{children}</LegalMdxA>,
  h1: MdxH1,
  h2: LegalMdxH2,
  h3: MdxH3,
  ul: MdxUl,
  ol: MdxOl,
  li: MdxLi,
};

export const LegalMdx: FC<PropsWithChildren> = ({children}) => {
  return (
    <MDXProvider components={components}>
      <Column>{children}</Column>
    </MDXProvider>
  );
};
