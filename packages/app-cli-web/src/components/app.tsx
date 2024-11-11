import {useConstant} from "@baqhub/sdk-react";
import {Column, Text} from "@baqhub/ui/core/style.js";
import {FC, useEffect} from "react";
import tiwi from "tiwi";

//
// Style.
//

const Layout = tiwi(Column)`
  flex-1

  items-center
  justify-center
`;

const Card = tiwi(Column)`
  bg-white
  rounded-2xl
  p-8

  gap-4
`;

const Header = tiwi(Column)`
  px-3
`;

const Title = tiwi(Text)`
  text-lg
  font-semibold
`;

const SubTitle = tiwi(Text)`
  text-lg
  font-light
`;

const Token = tiwi.div`
  p-3
  bg-amber-100
  rounded-md
`;

const TokenText = tiwi(Text)`
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
