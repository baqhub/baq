import {Handler} from "@baqhub/sdk";
import {Link, ToOptions} from "@tanstack/react-router";
import {FC, PropsWithChildren} from "react";
import tiwi from "tiwi";

//
// Props.
//

type TopNavItemLinkProps = ToOptions & PropsWithChildren;

interface TopNavItemProps extends PropsWithChildren {
  onClick: Handler;
}

//
// Style.
//

const Button = tiwi.button`
  px-2.5
  py-1.5

  rounded-lg

  select-none
  text-sm
  font-medium
  text-zinc-900
  dark:text-white
  hover:text-amber-800
  active:text-amber-700
  dark:hover:text-amber-400
  dark:active:text-amber-500

  group-data-[status=active]:bg-amber-100
  group-data-[status=active]:text-amber-800
  group-data-[status=active]:hover:text-amber-800
  group-data-[status=active]:dark:bg-amber-900
  group-data-[status=active]:dark:text-amber-200
  group-data-[status=active]:dark:hover:text-amber-200

  cursor-pointer
`;

const Icon = tiwi.div`
  w-5
  h-5
`;

//
// Component.
//

export function TopNavItemLink(props: TopNavItemLinkProps) {
  const {children, ...linkProps} = props;
  return (
    // TODO: Remove hack when types are fixed.
    <Link {...(linkProps as any)} className="group">
      <Button type="button">
        <Icon>{children}</Icon>
      </Button>
    </Link>
  );
}

export const TopNavItem: FC<TopNavItemProps> = props => {
  const {onClick, children} = props;

  return (
    <Button type="button" onClick={onClick}>
      <Icon>{children}</Icon>
    </Button>
  );
};
