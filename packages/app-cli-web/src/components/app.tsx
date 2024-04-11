import {useConstant} from "@baqhub/sdk-react";
import {Column, Text, tw} from "@baqhub/ui/core/style.js";
import {FC, useEffect} from "react";

//
// Style.
//

const Layout = tw(Column)`
  flex-1

  items-center
  justify-center
`;

const Card = tw(Column)`
  bg-white
  rounded-2xl
  p-8

  gap-4
`;

const Header = tw(Column)`
  px-3
`;

const Title = tw(Text)`
  text-lg
  font-semibold
`;

const SubTitle = tw(Text)`
  text-lg
  font-light
`;

const Token = tw.div`
  p-3
  bg-amber-100
  rounded-md
`;

const TokenText = tw(Text)`
  min-w-[18em]
  max-w-[26em]

  text-amber-800
  text-md
  font-mono
  select-all
  break-all
`;

//
// Component.
//

const authPrefix = "/auth";

export const App: FC = () => {
  const appToken = useConstant(() => {
    const url = new URL(window.location.href);
    if (!url.pathname.startsWith(authPrefix)) {
      return undefined;
    }

    return url.pathname.slice(authPrefix.length + 1) || undefined;
  });

  useEffect(() => {
    const url = new URL(window.location.href);
    if (!url.pathname.startsWith(authPrefix)) {
      return;
    }

    window.history.replaceState({}, "", "/");
  }, []);

  if (!appToken) {
    return null;
  }

  return (
    <Layout>
      <Card>
        <Header>
          <Title>BAQ CLI</Title>
          <SubTitle>Authentication Token</SubTitle>
        </Header>
        <Token>
          <TokenText>{appToken}</TokenText>
        </Token>
      </Card>
    </Layout>
  );
};
