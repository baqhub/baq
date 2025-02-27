import birdLogoUrl from "@assets/birdLogo.png";
import {Grid} from "@baqhub/ui/core/style.js";
import {ArrowLeftIcon} from "@heroicons/react/24/outline";
import {Link} from "@tanstack/react-router";
import {FC} from "react";
import tiwi from "tiwi";

//
// Style.
//

const Layout = tiwi(Grid)`
  grid-cols-[1fr_auto_1fr]
  items-center

  gap-3
  py-6
`;

const BackLink = tiwi(Link)`
  hidden
  md:block
  justify-self-start
  col-start-1

  p-4

  rounded-full
  hover:bg-neutral-300
  dark:hover:bg-neutral-800
  active:bg-neutral-400
  dark:active:bg-neutral-700
` as typeof Link;

const Icon = tiwi.div`
  h-6
  w-6

  text-neutral-900
  dark:text-white
`;

const Logo = tiwi.img`
  col-start-2
  h-16
  select-none
`;

//
// Component.
//

export const PublicHeader: FC = () => {
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
