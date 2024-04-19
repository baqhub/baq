import birdLogoUrl from "@assets/birdLogo.png";
import {Grid, tw} from "@baqhub/ui/core/style.js";
import {ArrowLeftIcon} from "@heroicons/react/24/outline";
import {Link} from "@tanstack/react-router";
import {FC} from "react";

//
// Style.
//

const Layout = tw(Grid)`
  grid-cols-[1fr_auto_1fr]
  items-center

  gap-3
  py-6
`;

const BackLink = tw(Link)`
  block
  justify-self-start
  col-start-1

  p-4

  rounded-full
  any-hover:hover:bg-neutral-300
  dark:any-hover:hover:bg-neutral-800
  active:bg-neutral-400
  any-hover:active:bg-neutral-400
  dark:active:bg-neutral-700
  dark:any-hover:active:bg-neutral-700
` as typeof Link;

const Icon = tw.div`
  h-6
  w-6

  text-neutral-900
  dark:text-white
`;

const Logo = tw.img`
  h-16
  select-none
`;

//
// Component.
//

export const PrivacyHeader: FC = () => {
  return (
    <Layout>
      <BackLink to="/">
        <Icon>
          <ArrowLeftIcon />
        </Icon>
      </BackLink>
      <Logo src={birdLogoUrl} alt="Bird Logo" />
    </Layout>
  );
};
