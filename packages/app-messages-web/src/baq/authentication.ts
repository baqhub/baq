/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import {
  SecureStorageAdapter,
  StorageAdapter,
  buildAuthentication as buildAuthenticationBase,
} from "@baqhub/sdk-react";
import {ConversationRecord} from "./conversationRecord.js";
import {FileRecord} from "./fileRecord.js";
import {MessageRecord} from "./messageRecord.js";

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
      name: "Messages",
      description: "Keep in touch with friends.",
      uris: {
        website: "https://messages.baq.dev",
        redirect: redirectUrl,
      },
      scopeRequest: {
        read: [ConversationRecord.link, MessageRecord.link, FileRecord.link],
        write: [ConversationRecord.link, MessageRecord.link, FileRecord.link],
      },
    },
  });
}
