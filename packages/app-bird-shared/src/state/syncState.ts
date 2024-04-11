import {Q, SubscriptionRecord} from "@baqhub/sdk";
import {PostRecord} from "../baq/postRecord.js";
import {useRecordHelpers, useRecordQuery} from "../baq/store.js";

export function useSyncState() {
  const {entity} = useRecordHelpers();
  useRecordQuery(
    {
      filter: Q.or(
        Q.and(
          Q.type(PostRecord),
          Q.or(Q.source("self"), Q.source("subscription"))
        ),
        Q.and(
          Q.type(SubscriptionRecord),
          Q.author(entity),
          Q.record("content.recordType", PostRecord.link)
        )
      ),
    },
    {mode: "sync"}
  );
}
