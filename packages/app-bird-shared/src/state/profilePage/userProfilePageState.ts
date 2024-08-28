import {EntityRecord, Q, Record} from "@baqhub/sdk";
import {useCallback} from "react";
import {PostRecord} from "../../baq/postRecord.js";
import {
  useRecordHelpers,
  useRecordQuery,
  useRecordsQuery,
} from "../../baq/store.js";

export interface UserProfileData {
  entity: string;
  name: string | undefined;
  bio: string | undefined;
}

export function useUserProfilePageState() {
  const {entity} = useRecordHelpers();
  const {getRecord: getEntityRecord} = useRecordQuery({
    filter: Q.and(Q.type(EntityRecord), Q.author(entity)),
  });

  const get = useCallback((): UserProfileData | undefined => {
    const entityRecord = getEntityRecord();
    if (!entityRecord) {
      return undefined;
    }

    return {
      entity: entityRecord.author.entity,
      name: entityRecord.content.profile.name,
      bio: entityRecord.content.profile.bio,
    };
  }, [getEntityRecord]);

  const {isLoading: arePostsLoading, getRecords} = useRecordsQuery({
    pageSize: 200,
    filter: Q.and(Q.type(PostRecord), Q.author(entity)),
  });

  const getPostKeys = useCallback(
    () => getRecords().map(Record.toKey),
    [getRecords]
  );

  return {
    get,
    arePostsLoading,
    getPostKeys,
  };
}
