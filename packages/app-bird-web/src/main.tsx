import {DateServicesProvider} from "@baqhub/bird-shared/components/date/dateServicesProvider.js";
import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import {StrictMode} from "react";
import ReactDOM from "react-dom/client";
import {appRoute} from "./components/app.js";
import {feedRoute} from "./components/feedPage/feedPage.js";
import {mentionsRoute} from "./components/mentionsPage/mentionsPage.js";
import {profileRoute} from "./components/profilePage/profilePage.js";
import "./styles/index.css";

//
// Routing.
//

export const rootRoute = createRootRoute();

const privacyRoute = createRoute({
  path: "/privacy",
  getParentRoute: () => rootRoute,
}).lazy(() =>
  import("./components/privacyPage/privacyPage.js").then(d => d.PrivacyRoute)
);

const routeTree = rootRoute.addChildren([
  privacyRoute,
  appRoute.addChildren([feedRoute, mentionsRoute, profileRoute]),
]);

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

//
// Render.
//

const locale =
  (navigator.languages &&
    navigator.languages.length &&
    navigator.languages[0]) ||
  navigator.language ||
  "en-us";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <DateServicesProvider locale={locale}>
      <RouterProvider router={router} />
    </DateServicesProvider>
  </StrictMode>
);
