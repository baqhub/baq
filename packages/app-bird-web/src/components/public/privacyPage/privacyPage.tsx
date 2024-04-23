import {createLazyRoute} from "@tanstack/react-router";
import {FC} from "react";
import Privacy from "./privacyContent.mdx";

//
// Component.
//

const PrivacyPage: FC = () => {
  return <Privacy />;
};

//
// Route.
//

export const PrivacyRoute = createLazyRoute("/public/privacy")({
  component: PrivacyPage,
});
