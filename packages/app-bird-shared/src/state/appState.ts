import {BuildAuthenticationOptions} from "@baqhub/sdk-react";
import {buildAuthentication} from "../baq/authentication.js";

interface AppStateProps {
  appIconUrl: string;
  redirectUrl: string;
  authorizationId?: string;
}

export function buildAppState(options: BuildAuthenticationOptions) {
  const {useAuthentication} = buildAuthentication(options);

  function useAppState(props: AppStateProps) {
    const {appIconUrl, redirectUrl, authorizationId} = props;

    const authOptions = {appIconUrl, authorizationId};
    return useAuthentication(redirectUrl, authOptions);
  }

  return {useAppState};
}
