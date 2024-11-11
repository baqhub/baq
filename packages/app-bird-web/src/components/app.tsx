import birdIconUrl from "@assets/birdIcon.png";
import birdLogoUrl from "@assets/birdLogo.png";
import {buildAuthentication} from "@baqhub/bird-shared/baq/authentication.js";
import {Store} from "@baqhub/bird-shared/baq/store.js";
import {useSyncState} from "@baqhub/bird-shared/state/syncState.js";
import {useConstant} from "@baqhub/sdk-react";
import {localStorageAdapter} from "@baqhub/sdk-react-dom";
import {Column} from "@baqhub/ui/core/style.js";
import {LayerManager} from "@baqhub/ui/layers/layerManager.js";
import {Login, LoginLogo} from "@baqhub/ui/pages/login.js";
import {
  Link,
  Outlet,
  ScrollRestoration,
  createRoute,
  useMatch,
  useNavigate,
  useParams,
} from "@tanstack/react-router";
import {FC, useEffect} from "react";
import tiwi from "tiwi";
import {rootRoute} from "../main.js";
import {profileRoute} from "./profilePage/profilePage.js";
import {PublicTopNav} from "./shared/topNav/publicTopNav.js";
import {TopNav} from "./shared/topNav/topNav.js";

//
// Constants.
//

const authPrefix = "/auth";
const redirectOrigin = window.location.origin;
const redirectUrl = redirectOrigin + authPrefix + "{/authorization_id}";

const {useAuthentication} = buildAuthentication({
  storage: localStorageAdapter,
  redirectUrl,
});

//
// Style.
//

const Layout = tiwi(Column)`
  self-stretch
  justify-self-center

  w-full
  max-w-screen-sm

  py-16
  px-3
  sm:px-5
`;

const Footer = tiwi(Column)`
  items-center
  p-5
`;

const PrivacyLink = tiwi(Link)`
  hover:underline
  underline-offset-2

  select-none
  text-neutral-400
  any-hover:hover:text-neutral-500
  dark:text-neutral-500
  dark:any-hover:hover:text-neutral-400
` as typeof Link;

//
// Component.
//

export const App: FC = () => {
  const navigate = useNavigate();
  const params = useParams({strict: false});

  const authorizationId = useConstant(() => {
    if (!("authorizationId" in params)) {
      return undefined;
    }

    return params.authorizationId;
  });

  useEffect(() => {
    const {pathname} = window.location;
    if (!pathname.startsWith(authPrefix)) {
      return;
    }

    navigate({to: "/", replace: true});
  }, [navigate]);

  const {state, onConnectRequest, onDisconnectRequest} = useAuthentication({
    appIconUrl: birdIconUrl,
    authorizationId,
  });

  // Login page.
  const profileMatch = useMatch({from: profileRoute.id, shouldThrow: false});
  if (state.status === "unauthenticated" && !profileMatch) {
    return (
      <Column>
        <Login appName="Bird" state={state} onConnectClick={onConnectRequest}>
          <LoginLogo alt="Bird app logo" src={birdLogoUrl} />
        </Login>
        <Footer>
          <PrivacyLink to="/privacy">Privacy Policy</PrivacyLink>
        </Footer>
      </Column>
    );
  }

  // Public app.
  if (state.status === "unauthenticated") {
    return (
      <Store>
        <LayerManager>
          <Layout>
            <Outlet />
          </Layout>
          <PublicTopNav />
          <ScrollRestoration />
        </LayerManager>
      </Store>
    );
  }

  // Main app.
  return (
    <Store identity={state.identity} onDisconnectRequest={onDisconnectRequest}>
      <LayerManager>
        <Sync />
        <Layout>
          <Outlet />
        </Layout>
        <TopNav />
        <ScrollRestoration />
      </LayerManager>
    </Store>
  );
};

const Sync: FC = () => {
  useSyncState();
  return <></>;
};

//
// Route.
//

export const appRoute = createRoute({
  id: "app",
  component: App,
  getParentRoute: () => rootRoute,
});
