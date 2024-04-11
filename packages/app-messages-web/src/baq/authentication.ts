/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import {
  BuildAuthenticationOptions,
  UseAuthenticationOptions,
  buildAuthentication as buildAuthenticationBase,
} from "@baqhub/sdk-react";
import {useCallback} from "react";
import {ConversationRecord} from "./conversationRecord.js";
import {FileRecord} from "./fileRecord.js";
import {MessageRecord} from "./messageRecord.js";

const scopeRequest = {
  read: [ConversationRecord.link, MessageRecord.link, FileRecord.link],
  write: [ConversationRecord.link, MessageRecord.link, FileRecord.link],
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
          name: "Messages",
          description: "Keep in touch with friends.",
          uris: {
            website: "https://messages.baq.dev",
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
