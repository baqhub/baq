import {DateServicesProvider} from "@baqhub/ui/date/dateServicesProvider.js";
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

const publicLayoutRoute = createRoute({
  id: "public",
  getParentRoute: () => rootRoute,
}).lazy(() =>
  import("./components/public/publicLayout.js").then(d => d.PublicLayoutRoute)
);

const eulaRoute = createRoute({
  path: "/eula",
  getParentRoute: () => publicLayoutRoute,
}).lazy(() =>
  import("./components/public/eulaPage/eulaPage.js").then(d => d.EulaRoute)
);

const privacyRoute = createRoute({
  path: "/privacy",
  getParentRoute: () => publicLayoutRoute,
}).lazy(() =>
  import("./components/public/privacyPage/privacyPage.js").then(
    d => d.PrivacyRoute
  )
);

const authRoute = createRoute({
  path: "/auth",
  getParentRoute: () => appRoute,
});

const authAuthorizationRoute = createRoute({
  path: "$authorizationId",
  getParentRoute: () => authRoute,
});

const routeTree = rootRoute.addChildren([
  publicLayoutRoute.addChildren([eulaRoute, privacyRoute]),
  appRoute.addChildren([
    authRoute.addChildren([authAuthorizationRoute]),
    mentionsRoute,
    profileRoute,
    feedRoute,
  ]),
]);

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  scrollRestoration: true,
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
