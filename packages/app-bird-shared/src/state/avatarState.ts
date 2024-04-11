import {useMemo} from "react";
import {useFindEntityRecord, useRecordHelpers} from "../baq/store.js";

export function useAvatarState(entity: string | undefined) {
  const {buildBlobUrl} = useRecordHelpers();
  const entityRecord = useFindEntityRecord(entity);

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
  };
}
