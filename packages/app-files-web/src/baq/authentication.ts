/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import {
  BuildAuthenticationOptions,
  UseAuthenticationOptions,
  buildAuthentication as buildAuthenticationBase,
} from "@baqhub/sdk-react";
import {useCallback} from "react";
import {FileRecord} from "./fileRecord.js";
import {FolderRecord} from "./folderRecord.js";

const scopeRequest = {
  read: [FolderRecord.link, FileRecord.link],
  write: [FolderRecord.link, FileRecord.link],
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
          name: "Files",
          description: "Manage your files in the cloud with ease.",
          uris: {
            website: "https://files.baq.dev",
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
