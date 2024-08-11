"use client";

import {tw} from "@baqhub/ui/core/style.jsx";
import {usePathname} from "next/navigation.js";
import type {FC, PropsWithChildren} from "react";
import {Link} from "../link.jsx";

//
// Props.
//

interface TopNavItemProps extends PropsWithChildren {
  to: string;
}

//
// Style.
//

const NavLink = tw(Link)`
  px-2.5
  py-1.5

  text-sm
  font-medium
  text-zinc-900
  dark:text-white
  select-none

  rounded-lg
`;

const baseStyle = `
  hover:text-amber-800
  dark:hover:text-amber-400
`;

const activeStyle = `
  bg-amber-100
  text-amber-800
  dark:bg-amber-900
  dark:text-amber-200
`;

//
// Component.
//

export const TopNavItem: FC<TopNavItemProps> = ({to, children}) => {
  const isActive = usePathname().startsWith(to);
  return (
    <NavLink href={to} className={isActive ? activeStyle : baseStyle}>
      {children}
    </NavLink>
  );
};
