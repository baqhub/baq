import * as IO from "../../helpers/io.js";
import {AnyRecordLink, RecordLink} from "../links/recordLink.js";
import {AppRecord} from "./appRecord.js";

//
// Model.
//

export const RAppScopes = IO.partialObject({
  read: IO.readonlyArray(AnyRecordLink.io()),
  write: IO.readonlyArray(AnyRecordLink.io()),
  subscribe: IO.readonlyArray(AnyRecordLink.io()),
  import: IO.readonlyArray(AnyRecordLink.io()),
  notify: IO.readonlyArray(AnyRecordLink.io()),
});

export interface AppScopes extends IO.TypeOf<typeof RAppScopes> {}

//
// Helpers.
//

function hasScopes(appRecord: AppRecord, scopes: AppScopes) {
  const {scopeRequest} = appRecord.content;

  const hasScope = (
    scope: keyof AppScopes,
    value: ReadonlyArray<AnyRecordLink> = []
  ) => {
    const requestValue = scopeRequest[scope] || [];
    return value.every(link =>
      requestValue.some(requestLink => RecordLink.isSame(link, requestLink))
    );
  };

  return Object.keys(scopes).every(key => {
    const scope = key as keyof AppScopes;
    return hasScope(scope, scopes[scope]);
  });
}

export const AppScopes = {
  hasScopes,
};
