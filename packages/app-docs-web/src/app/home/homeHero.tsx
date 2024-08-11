import {Column, Row, tw} from "@baqhub/ui/core/style.jsx";
import {FC} from "react";
import LogoHero from "../../docs/assets/logoHero.svg";
import LogoHeroText from "../../docs/assets/logoHeroText.svg";
import {TextSelect} from "../global/style.jsx";
import {HomeGetStarted} from "./homeGetStarted.jsx";
import {HomeViewOnGithub} from "./homeViewOnGithub.jsx";

//
// Style.
//

const Layout = tw(Column)`
  relative
  pt-12
  pb-20
`;

const Content = tw(Column)`
  relative

  items-center
  mdp:items-start
`;

const Logo = tw.div`
  [&_>_svg]:h-14
`;

const Title = tw(TextSelect)`
  mt-2.5

  text-center
  mdp:text-left

  text-6xl
  leading-[70px]
  font-extrabold

  text-zinc-800
  dark:text-white
`;

const SubTitle = tw(TextSelect)`
  mt-5

  text-center
  mdp:text-left

  text-[28px]
  leading-[40px]
  text-zinc-500
  dark:text-zinc-400
`;

const Buttons = tw(Row)`
  mt-10
  gap-4
`;

const LogoBig = tw.div`
  absolute
  -top-4
  -bottom-4
  -right-20
  lg:-right-8
  aspect-square
`;

//
// Component.
//

export const HomeHero: FC = () => {
  return (
    <Layout>
      <LogoBig>
        <LogoHero />
      </LogoBig>
      <Content>
        <Logo>
          <LogoHeroText />
        </Logo>
        <Title>
          The Federated <br />
          App Platform
        </Title>
        <SubTitle>
          Build connected apps faster,
          <br />
          keep users in control.
        </SubTitle>
        <Buttons>
          <HomeGetStarted />
          <HomeViewOnGithub />
        </Buttons>
      </Content>
    </Layout>
  );
};
