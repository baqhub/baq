import {localStorageAdapter} from "@baqhub/sdk-react-dom";
import {buildAuthentication} from "../baq/authentication.js";

const redirectOrigin = window.location.origin;
const redirectUrl = redirectOrigin + "/auth{/authorization_id}";

const {useAuthentication} = buildAuthentication({
  storage: localStorageAdapter,
});

export function useAppState(
  appIconUrl: string,
  authorizationId: string | undefined
) {
  const options = {appIconUrl, authorizationId};
  return useAuthentication(redirectUrl, options);
}
