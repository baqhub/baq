import birdIconUrl from "@assets/birdIcon.png";
import birdLogoUrl from "@assets/birdLogo.png";
import {Store} from "@baqhub/bird-shared/baq/store.js";
import {buildAppState} from "@baqhub/bird-shared/state/appState.js";
import {useSyncState} from "@baqhub/bird-shared/state/syncState.js";
import {useConstant} from "@baqhub/sdk-react";
import {localStorageAdapter} from "@baqhub/sdk-react-dom";
import {Column, tw} from "@baqhub/ui/core/style.js";
import {LayerManager} from "@baqhub/ui/layers/layerManager.js";
import {Login, LoginLogo} from "@baqhub/ui/pages/login.js";
import {
  Link,
  Outlet,
  ScrollRestoration,
  createRoute,
  useNavigate,
} from "@tanstack/react-router";
import {FC, useEffect} from "react";
import {rootRoute} from "../main.js";
import {TopNav} from "./shared/topNav/topNav.js";

//
// Constants.
//

const authPrefix = "/auth";
const redirectOrigin = window.location.origin;
const redirectUrl = redirectOrigin + authPrefix + "{/authorization_id}";

const {useAppState} = buildAppState({
  storage: localStorageAdapter,
});

//
// Style.
//

const Layout = tw(Column)`
  self-stretch
  justify-self-center

  w-full
  max-w-screen-sm

  py-16
  px-3
  sm:px-5
`;

const Footer = tw(Column)`
  items-center
  p-5
`;

const PrivacyLink = tw(Link)`
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

  const authorizationId = useConstant(() => {
    const {pathname} = window.location;
    if (!pathname.startsWith(authPrefix)) {
      return undefined;
    }

    return pathname.slice(authPrefix.length + 1) || undefined;
  });

  useEffect(() => {
    const {pathname} = window.location;
    if (!pathname.startsWith(authPrefix)) {
      return;
    }

    navigate({to: "/", replace: true});
  }, [navigate]);

  const {state, onConnectRequest, onDisconnectRequest} = useAppState({
    appIconUrl: birdIconUrl,
    redirectUrl,
    authorizationId,
  });

  if (state.status === "unauthenticated") {
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
