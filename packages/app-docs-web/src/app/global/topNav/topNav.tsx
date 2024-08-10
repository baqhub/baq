import {Column, Row, tw} from "@baqhub/ui/core/style.jsx";
import {DiscordIcon} from "@baqhub/ui/icons/filled/discord.jsx";
import {GithubIcon} from "@baqhub/ui/icons/filled/github.jsx";
import type {FC} from "react";
import LogoSmall from "../../../docs/assets/logoSmall.svg";
import {SvgUniqueIds} from "../../../helpers/svgUniqueIds.jsx";
import {Link} from "../link.jsx";
import {TopNavItem} from "./topNavItem.jsx";
import {TopNavLink} from "./topNavLink.jsx";
import {TopNavSearch} from "./topNavSearch.jsx";
import {TopNavTheme} from "./topNavTheme.jsx";

//
// Style.
//

const Layout = tw.div`
  relative
  w-full
  h-[calc(4rem_+_1px)]
`;

const Content = tw(Column)`
  lg:fixed
  w-full
  z-10

  items-center

  border-b
  border-zinc-200
  dark:border-zinc-950
  lg:border-transparent
  dark:lg:border-transparent

  lg:drop-shadow-[0_16px_8px_rgba(255,255,255,1)]
  dark:lg:drop-shadow-[0_16px_8px_rgba(39,39,42,1)]

  bg-white
  dark:bg-zinc-800
`;

const Center = tw(Row)`
  w-full
  max-w-screen-2xl
  h-16

  px-3
  sm:px-5
  lg:pl-64

  items-center
  sm:gap-2
`;

const TitleLink = tw(Link)`
  lg:hidden
  py-1
  px-3

  text-zinc-900
  hover:text-zinc-600
  dark:text-white
  dark:hover:text-neutral-200
`;

const TitleLogo = tw(LogoSmall)`
  h-8
`;

const Items = tw(Row)`
  px-0.5
  sm:gap-2
`;

const Links = tw(Row)`
  hidden
  sm:flex

  px-1.5
  gap-4
`;

const Separator = tw.div`
  hidden
  sm:block

  w-1.5
  h-1.5
  mx-2

  rounded-full
  bg-zinc-300
  dark:bg-zinc-600
`;

//
// Component.
//

export const TopNav: FC = () => {
  return (
    <>
      <Layout>
        <Content>
          <Center>
            <TitleLink href="/">
              <SvgUniqueIds>
                <TitleLogo />
              </SvgUniqueIds>
            </TitleLink>
            <TopNavSearch />
            <Items>
              <TopNavItem to="/docs/learn">Learn</TopNavItem>
              <TopNavItem to="/docs/reference">Reference</TopNavItem>
              <TopNavItem to="/blog">Blog</TopNavItem>
            </Items>
            <Separator />
            <Links>
              <TopNavLink href="https://discord.gg/jg9wMG9s83">
                <DiscordIcon />
              </TopNavLink>
              <TopNavLink href="https://github.com/baqhub/baq">
                <GithubIcon />
              </TopNavLink>
            </Links>
            <Separator />
            <Links>
              <TopNavTheme />
            </Links>
          </Center>
        </Content>
      </Layout>
    </>
  );
};
