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
  mdp:flex-row-reverse

  pt-12
  pb-14
  md:pb-20

  gap-6
  items-center
  mdp:items-stretch
`;

const Content = tw(Column)`
  flex-1
  relative

  items-center
  mdp:items-start
`;

const Logo = tw.div`
  [&_>_svg]:h-12
  sm:[&_>_svg]:h-14
`;

const Title = tw(TextSelect)`
  mt-2.5

  text-center
  mdp:text-left

  text-4xl
  leading-[46px]
  sm:text-5xl
  sm:leading-[58px]
  mdp:text-6xl
  mdp:leading-[70px]
  font-extrabold

  text-zinc-800
  dark:text-white
`;

const SubTitle = tw(TextSelect)`
  mt-5

  text-center
  mdp:text-left

  text-xl
  sm:text-2xl
  sm:leading-[34px]
  mdp:text-[28px]
  mdp:leading-[40px]
  text-zinc-500
  dark:text-zinc-400
`;

const LineBreak = tw.br`
`;

const Buttons = tw(Row)`
  mt-10
  gap-4
`;

const LogoContainer = tw.div`
  relative
`;

// const LogoBig = tw.div`
//   absolute
//   -top-4
//   -bottom-4
//   -right-20
//   lg:-right-8
//   aspect-square
// `;
const LogoBig = tw.div`
  -m-16
  h-72
  mdp:-m-0
  mdp:h-auto
  mdp:absolute
  mdp:-top-4
  mdp:-bottom-4
  mdp:-right-16
  lg:-top-12
  lg:-bottom-12
  lg:-right-2

  aspect-square
`;

//
// Component.
//

export const HomeHero: FC = () => {
  return (
    <Layout>
      <LogoContainer>
        <LogoBig>
          <LogoHero />
        </LogoBig>
      </LogoContainer>
      <Content>
        <Logo>
          <LogoHeroText />
        </Logo>
        <Title>
          The Federated <LineBreak />
          App Platform
        </Title>
        <SubTitle>
          Build connected apps faster,
          <LineBreak />
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
