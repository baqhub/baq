import {Column, Grid} from "@baqhub/ui/core/style.jsx";
import {
  ArrowPathIcon,
  BoltIcon,
  CommandLineIcon,
  LockClosedIcon,
  ServerStackIcon,
  SwatchIcon,
} from "@heroicons/react/24/outline";
import {FC} from "react";
import tiwi from "tiwi";
import {Footer} from "./global/footer.jsx";
import {HomeCard} from "./home/homeCard.jsx";
import {HomeHero} from "./home/homeHero.jsx";

//
// Style.
//

const Layout = tiwi(Column)`
  self-center
  w-full
  max-w-(--breakpoint-xl)
  overflow-x-hidden

  pt-2
  px-6
  md:pt-8
  md:px-12
  mdp:px-16
`;

const Cards = tiwi(Grid)`
  grid-cols-1
  md:grid-cols-2
  lg:grid-cols-3
  grid-rows-none
  auto-rows-auto
  grid-flow-row
  gap-4
`;

const FooterLayout = tiwi(Column)`
  mt-14
  md:mt-20
`;

//
// Component.
//

const Home: FC = () => {
  return (
    <Layout>
      <HomeHero />
      <Cards>
        <HomeCard icon={<SwatchIcon />} title="Flexible Data Format">
          Craft the perfect app data model using powerful BAQ schemas.
        </HomeCard>
        <HomeCard icon={<LockClosedIcon />} title="Private, Shared, or Public">
          Set the right permissions and let BAQ handle the rest.
        </HomeCard>
        <HomeCard icon={<ArrowPathIcon />} title="App Interoperability">
          Re-use existing schemas and seamlessly share data with other apps.
        </HomeCard>
        <HomeCard icon={<BoltIcon />} title="Proven Technology">
          Tried and true DNS, HTTP, and JSON. We’re not re-inventing the wheel.
        </HomeCard>
        <HomeCard icon={<ServerStackIcon />} title="Backend Included">
          No server code to write, no infra to scale. More time to build great
          apps!
        </HomeCard>
        <HomeCard icon={<CommandLineIcon />} title="Powerful SDK">
          Send simple requests, or manage your entire application state.
        </HomeCard>
      </Cards>
      <FooterLayout>
        <Footer />
      </FooterLayout>
    </Layout>
  );
};

export default Home;
