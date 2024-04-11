import {DateServicesProvider} from "@baqhub/bird-shared/components/date/dateServicesProvider.js";
import {Router, RouterProvider} from "@tanstack/react-router";
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

const routeTree = appRoute.addChildren([
  feedRoute,
  mentionsRoute,
  profileRoute,
]);
const router = new Router({routeTree});

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
