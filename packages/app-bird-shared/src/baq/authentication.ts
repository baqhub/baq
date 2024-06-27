/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import {
  SecureStorageAdapter,
  StorageAdapter,
  buildAuthentication as buildAuthenticationBase,
} from "@baqhub/sdk-react";
import {PostRecord} from "./postRecord.js";

export interface BuildAuthenticationOptions {
  storage: StorageAdapter;
  secureStorage?: SecureStorageAdapter;
  redirectUrl: string;
}

export function buildAuthentication(options: BuildAuthenticationOptions) {
  const {storage, secureStorage, redirectUrl} = options;
  return buildAuthenticationBase({
    storage,
    secureStorage,
    app: {
      name: "Bird",
      description: "Simple short-form social network.",
      uris: {
        website: "https://bird.baq.dev",
        redirect: redirectUrl,
      },
      scopeRequest: {
        read: [PostRecord.link],
        write: [PostRecord.link],
        subscribe: [PostRecord.link],
      },
    },
  });
}
