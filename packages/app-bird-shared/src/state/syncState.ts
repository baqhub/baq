import {Q, SubscriptionRecord} from "@baqhub/sdk";
import {PostRecord} from "../baq/postRecord.js";
import {useRecordHelpers, useRecordQuery} from "../baq/store.js";

export function useSyncState() {
  const {entity} = useRecordHelpers();
  useRecordQuery(
    {
      sources: ["self", "subscription"],
      filter: Q.or(
        Q.type(PostRecord),
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
