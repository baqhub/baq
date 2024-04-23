import {createLazyRoute} from "@tanstack/react-router";
import {FC} from "react";
import Eula from "./eulaContent.mdx";

//
// Component.
//

const EulaPage: FC = () => {
  return <Eula />;
};

//
// Route.
//

export const EulaRoute = createLazyRoute("/public/eula")({
  component: EulaPage,
});
