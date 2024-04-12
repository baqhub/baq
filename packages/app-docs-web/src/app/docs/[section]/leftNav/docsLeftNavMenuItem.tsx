import {tw} from "@baqhub/ui/core/style.jsx";
import {FC, PropsWithChildren} from "react";
import {Link} from "../../../global/link.jsx";

//
// Props.
//

interface DocsLeftNavMenuItemProps extends PropsWithChildren {
  to: string;
  isActive: boolean;
  onClick?: () => void;
}

//
// Style.
//

const MenuLink = tw(Link)`
  truncate
  text-sm
  font-medium
  text-zinc-500
  dark:text-zinc-400
  hover:text-amber-700
  dark:hover:text-amber-400
`;

const activeMenuLink = `
  text-amber-700
  dark:text-amber-400
`;

//
// Component.
//

export const DocsLeftNavMenuItem: FC<DocsLeftNavMenuItemProps> = props => {
  const {to, isActive, onClick, children} = props;
  return (
    <MenuLink
      href={to}
      className={isActive ? activeMenuLink : undefined}
      onClick={onClick}
    >
      {children}
    </MenuLink>
  );
};
