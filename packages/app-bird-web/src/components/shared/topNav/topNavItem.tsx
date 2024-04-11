import {Handler} from "@baqhub/sdk";
import {tw} from "@baqhub/ui/core/style.js";
import {
  AnyRoute,
  Link,
  RegisteredRouter,
  RoutePaths,
  ToOptions,
} from "@tanstack/react-router";
import {FC, PropsWithChildren} from "react";

//
// Props.
//

type TopNavItemLinkProps<
  TRouteTree extends AnyRoute,
  TFrom extends RoutePaths<TRouteTree> | string,
  TTo extends string,
  TMaskFrom extends RoutePaths<TRouteTree> | string,
  TMaskTo extends string,
> = ToOptions<TRouteTree, TFrom, TTo, TMaskFrom, TMaskTo> & PropsWithChildren;

interface TopNavItemProps extends PropsWithChildren {
  onClick: Handler;
}

//
// Style.
//

const Button = tw.button`
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
`;

const Icon = tw.div`
  w-5
  h-5
`;

//
// Component.
//

export function TopNavItemLink<
  TRouteTree extends AnyRoute = RegisteredRouter["routeTree"],
  TFrom extends RoutePaths<TRouteTree> | string = string,
  TTo extends string = "",
  TMaskFrom extends RoutePaths<TRouteTree> | string = TFrom,
  TMaskTo extends string = "",
>(props: TopNavItemLinkProps<TRouteTree, TFrom, TTo, TMaskFrom, TMaskTo>) {
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
