import {Column, Row} from "@baqhub/ui/core/style.js";
import {Outlet, createLazyRoute} from "@tanstack/react-router";
import {FC} from "react";
import tiwi from "tiwi";
import {LegalMdx} from "./legalMdx.js";
import {PublicHeader} from "./publicHeader.js";

//
// Style.
//

const Layout = tiwi(Row)`
  justify-center
`;

const Center = tiwi(Column)`
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

const PublicLayout: FC = () => {
  return (
    <Layout>
      <Center>
        <PublicHeader />
        <LegalMdx>
          <Outlet />
        </LegalMdx>
      </Center>
    </Layout>
  );
};

//
// Route.
//

export const PublicLayoutRoute = createLazyRoute("/public")({
  component: PublicLayout,
});
