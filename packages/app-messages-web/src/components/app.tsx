import messagesIconUrl from "@assets/messagesIcon.png";
import messagesLogoUrl from "@assets/messagesLogo.png";
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
    messagesIconUrl,
    authorizationId
  );

  switch (state.status) {
    case AuthenticationStatus.UNAUTHENTICATED:
      return (
        <Login
          appName="Messages"
          state={state}
          onConnectClick={onConnectRequest}
        >
          <LoginLogo alt="Messages app logo" src={messagesLogoUrl} />
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
