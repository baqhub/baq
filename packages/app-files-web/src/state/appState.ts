import {localStorageAdapter} from "@baqhub/sdk-react-dom";
import {buildAuthentication} from "../baq/authentication.js";

const websiteUrl = "https://files.baq.dev";
const redirectHost = import.meta.env.DEV ? "http://localhost:5174" : websiteUrl;
const redirectUrl = redirectHost + "/auth{/authorization_id}";

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
