import {StandingDecision} from "@baqhub/sdk";
import {useMemo} from "react";
import {
  useFindEntityRecord,
  useFindStandingDecision,
  useRecordHelpers,
} from "../baq/store.js";

export function useAvatarState(entity: string | undefined) {
  const {buildBlobUrl} = useRecordHelpers();
  const entityRecord = useFindEntityRecord(entity);
  const decision = useFindStandingDecision(entity);

  const avatarUrl = useMemo(() => {
    if (!entityRecord) {
      return undefined;
    }

    const {avatar} = entityRecord.content.profile;
    if (!avatar) {
      return undefined;
    }

    return buildBlobUrl(entityRecord, avatar);
  }, [entityRecord, buildBlobUrl]);

  return {
    avatarUrl,
    isBlocked: decision === StandingDecision.BLOCK,
  };
}
