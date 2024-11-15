import {FC, PropsWithChildren} from "react";
import tiwi from "tiwi";

//
// Props.
//

interface TopNavLinkProps extends PropsWithChildren {
  href: string;
}

//
// Style.
//

const Link = tiwi.a`
  shrink-0
  block
  p-0.5

  text-zinc-700
  dark:text-zinc-200
  hover:text-amber-800
  dark:hover:text-amber-400
`;

const LinkIcon = tiwi.div`
  w-5
  h-5
`;

//
// Component.
//

export const TopNavLink: FC<TopNavLinkProps> = props => {
  const {href, children} = props;

  return (
    <Link href={href} target="_blank">
      <LinkIcon>{children}</LinkIcon>
    </Link>
  );
};
