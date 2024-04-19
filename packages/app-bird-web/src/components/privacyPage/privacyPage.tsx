import {Column, Row, tw} from "@baqhub/ui/core/style.js";
import {createLazyRoute} from "@tanstack/react-router";
import {FC} from "react";
import {LegalMdx} from "../shared/legalMdx.js";
import Privacy from "./privacyContent.mdx";
import {PrivacyHeader} from "./privacyHeader.js";

//
// Style.
//

const Layout = tw(Row)`
  justify-center
`;

const Center = tw(Column)`
  flex-1
  max-w-[936px]

  py-10
  px-10
  sm:px-12
  lg:px-16

  gap-10
`;

//
// Component.
//

const PrivacyPage: FC = () => {
  return (
    <Layout>
      <Center>
        <PrivacyHeader />
        <LegalMdx>
          <Privacy />
        </LegalMdx>
      </Center>
    </Layout>
  );
};

//
// Route.
//

export const PrivacyRoute = createLazyRoute("/privacy")({
  component: PrivacyPage,
});
