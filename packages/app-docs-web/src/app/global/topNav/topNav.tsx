"use client";

import {Column, Row} from "@baqhub/ui/core/style.jsx";
import {usePathname} from "next/navigation.js";
import type {FC} from "react";
import tiwi from "tiwi";
import LogoSmall from "../../../docs/assets/logoSmall.svg";
import {SvgUniqueIds} from "../../../helpers/svgUniqueIds.jsx";
import {DiscordIcon} from "../icons/discord.jsx";
import {GithubIcon} from "../icons/github.jsx";
import {Link} from "../link.jsx";
import {TopNavItem} from "./topNavItem.jsx";
import {TopNavLink} from "./topNavLink.jsx";
import {TopNavSearch} from "./topNavSearch.jsx";
import {TopNavTheme} from "./topNavTheme.jsx";

//
// Style.
//

const Layout = tiwi.div`
  relative
  h-[calc(4rem_+_1px)]
  w-full
`;

const Content = tiwi(Column)`
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

const Center = tiwi(Row)`
  w-full
  max-w-(--breakpoint-2xl)
  h-16

  px-3
  sm:px-5

  items-center
  sm:gap-2
`;

const LeftNavSpacer = tiwi.div`
  mr-1
  hidden
  w-64
  lg:block
  xl:mr-5
`;

const Title = tiwi(Row)`
  shrink-0
  py-1
  px-3
  lg:mr-6

  text-zinc-900
  dark:text-white
`;

const TitleLink = tiwi(Link)`
  shrink-0
  py-1
  px-3

  text-zinc-900
  hover:text-amber-700
  dark:text-white
  dark:hover:text-amber-400
`;

const DocsTitleLink = tiwi(TitleLink)`
  lg:hidden
`;

const DefaultTitleLink = tiwi(TitleLink)`
  lg:mr-6
`;

const TitleLogo = tiwi(LogoSmall)`
  h-8
`;

const Items = tiwi(Row)`
  px-0.5
  sm:gap-2
`;

const Links = tiwi(Row)`
  hidden
  sm:flex

  px-1.5
  gap-4
`;

const Separator = tiwi.div`
  mx-2
  hidden

  h-1.5
  w-1.5
  rounded-full

  bg-zinc-300
  sm:block
  dark:bg-zinc-600
`;

//
// Component.
//

export const TopNav: FC = () => {
  const pn = usePathname();

  const renderTitle = () => {
    // Home, no link.
    if (pn === "/") {
      return (
        <Title>
          <SvgUniqueIds>
            <TitleLogo />
          </SvgUniqueIds>
        </Title>
      );
    }

    // Docs, link with spacer.
    if (pn.startsWith("/docs")) {
      return (
        <>
          <DocsTitleLink href="/">
            <SvgUniqueIds>
              <TitleLogo />
            </SvgUniqueIds>
          </DocsTitleLink>
          <LeftNavSpacer />
        </>
      );
    }

    // Otherwise, simple link.
    return (
      <DefaultTitleLink href="/">
        <SvgUniqueIds>
          <TitleLogo />
        </SvgUniqueIds>
      </DefaultTitleLink>
    );
  };

  return (
    <>
      <Layout>
        <Content>
          <Center>
            {renderTitle()}
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
