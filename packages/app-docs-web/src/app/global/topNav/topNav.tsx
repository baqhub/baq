import {Column, Row, tw} from "@baqhub/ui/core/style.js";
import type {FC} from "react";
import {Link} from "../link.js";
import {Text} from "../style.js";
import {TopNavItem} from "./topNavItem.js";

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
  items-center
  gap-2
`;

const TitleLink = tw(Link)`
  py-1
  px-3
`;

const TitleText = tw(Text)`
  text-lg
  font-semibold
`;

const Items = tw(Row)`
  px-0.5
  gap-2
`;

const Spacer = tw.div`
  grow
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
              <TitleText>BAQ</TitleText>
            </TitleLink>
            <Spacer />
            <Items>
              <TopNavItem to="/docs/learn">Learn</TopNavItem>
              <TopNavItem to="/docs/reference">Reference</TopNavItem>
              <TopNavItem to="/blog">Blog</TopNavItem>
            </Items>
          </Center>
        </Content>
      </Layout>
    </>
  );
};
