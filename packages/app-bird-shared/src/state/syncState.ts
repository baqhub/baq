import {Q, StandingRecord, SubscriptionRecord} from "@baqhub/sdk";
import {PostRecord} from "../baq/postRecord.js";
import {useRecordHelpers, useRecordQuery} from "../baq/store.js";

export function useSyncState() {
  const {entity} = useRecordHelpers();
  useRecordQuery(
    {
      filter: Q.or(
        Q.type(PostRecord),
        Q.type(StandingRecord),
        Q.and(
          Q.type(SubscriptionRecord),
          Q.author(entity),
          Q.record("content.recordType", PostRecord.link)
        )
      ),
      includeLinks: ["entity", "existential", "standing"],
    },
    {mode: "sync"}
  );
}
