/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import {
  BuildAuthenticationOptions,
  UseAuthenticationOptions,
  buildAuthentication as buildAuthenticationBase,
} from "@baqhub/sdk-react";
import {useCallback} from "react";
import {PostRecord} from "./postRecord.js";

const scopeRequest = {
  read: [PostRecord.link],
  write: [PostRecord.link],
  subscribe: [PostRecord.link],
};

export function buildAuthentication(options: BuildAuthenticationOptions) {
  const {useAuthentication: useAuthBase} = buildAuthenticationBase({
    ...options,
    scopeRequest,
  });

  function useAuthentication(
    redirectUrl: string,
    options: UseAuthenticationOptions
  ) {
    const authentication = useAuthBase(options);
    const {onConnectRequest: onConnectRequestBase} = authentication;

    const onConnectRequest = useCallback(
      (entity: string) => {
        onConnectRequestBase(entity, {
          name: "Bird",
          description: "Simple short-form social network.",
          uris: {
            website: "https://bird.baq.dev",
            redirect: redirectUrl,
          },
          scopeRequest,
        });
      },
      [onConnectRequestBase, redirectUrl]
    );

    return {
      ...authentication,
      onConnectRequest,
    };
  }

  return {useAuthentication};
}
