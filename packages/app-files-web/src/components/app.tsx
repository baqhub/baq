import filesIconUrl from "@assets/filesIcon.png";
import filesLogoUrl from "@assets/filesLogo.png";
import {unreachable} from "@baqhub/sdk";
import {AuthenticationStatus, useConstant} from "@baqhub/sdk-react";
import {Login, LoginLogo} from "@baqhub/ui/pages/login.js";
import {FC, useEffect} from "react";
import {Store} from "../baq/store.js";
import {useAppState} from "../state/appState.js";
import {Home} from "./home.js";

//
// Component.
//

const authPrefix = "/auth";

export const App: FC = () => {
  const authorizationId = useConstant(() => {
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

  const {state, onConnectRequest, onDisconnectRequest} = useAppState(
    filesIconUrl,
    authorizationId
  );

  switch (state.status) {
    case AuthenticationStatus.UNAUTHENTICATED:
      return (
        <Login appName="Files" state={state} onConnectClick={onConnectRequest}>
          <LoginLogo alt="Files app logo" src={filesLogoUrl} />
        </Login>
      );

    case AuthenticationStatus.AUTHENTICATED:
      return (
        <Store
          identity={state.identity}
          onDisconnectRequest={onDisconnectRequest}
        >
          <Home />
        </Store>
      );

    default:
      unreachable(state);
  }
};
