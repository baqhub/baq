/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import {
  SecureStorageAdapter,
  StorageAdapter,
  buildAuthentication as buildAuthenticationBase,
} from "@baqhub/sdk-react";
import {FileRecord} from "./fileRecord.js";
import {FolderRecord} from "./folderRecord.js";

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
      name: "Files",
      description: "Manage your files in the cloud with ease.",
      uris: {
        website: "https://files.baq.dev",
        redirect: redirectUrl,
      },
      scopeRequest: {
        read: [FolderRecord.link, FileRecord.link],
        write: [FolderRecord.link, FileRecord.link],
      },
    },
  });
}
