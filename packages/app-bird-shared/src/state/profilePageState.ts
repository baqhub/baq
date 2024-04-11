import {EntityRecord, Q, Record, SubscriptionRecord} from "@baqhub/sdk";
import {useCallback} from "react";
import {PostRecord} from "../baq/postRecord.js";
import {
  useRecordHelpers,
  useRecordQuery,
  useStaticRecordQuery,
  useStaticRecordsQuery,
  wrapInProxyStore,
} from "../baq/store.js";

export interface ProfileData {
  isProxy: boolean;
  entity: string;
  name: string | undefined;
  bio: string | undefined;
  isOwnProfile: boolean;
}

export interface FullProfileData extends ProfileData {
  isSubscribed: boolean;
}

export function useProfilePageState(profileEntity: string) {
  const {entity, updateRecords} = useRecordHelpers();

  //
  // Subscription.
  //

  const {isLoading: isFullLoading, getRecord: getSubscriptionRecord} =
    useRecordQuery({
      filter: Q.and(
        Q.type(SubscriptionRecord),
        Q.author(entity),
        Q.entity("content.publisher", profileEntity),
        Q.record("content.recordType", PostRecord.link)
      ),
    });

  //
  // Fetch profile.
  //

  const {getRecord: getEntityRecord} = useStaticRecordQuery({
    filter: Q.and(Q.type(EntityRecord), Q.author(profileEntity)),
    proxyTo: profileEntity,
  });

  const getProfile = useCallback((): ProfileData | undefined => {
    const entityRecord = getEntityRecord();
    if (!entityRecord) {
      return undefined;
    }

    return {
      isProxy: entityRecord.source === "proxy",
      entity: entityRecord.author.entity,
      name: entityRecord.content.profile.name,
      bio: entityRecord.content.profile.bio,
      isOwnProfile: entityRecord.author.entity === entity,
    };
  }, [entity, getEntityRecord]);

  const getFull = useCallback((): FullProfileData | undefined => {
    const profile = getProfile();
    const subscriptionRecord = getSubscriptionRecord();

    if (!profile) {
      return undefined;
    }

    return {
      ...profile,
      isSubscribed: Boolean(subscriptionRecord),
    };
  }, [getProfile, getSubscriptionRecord]);

  const {isLoading: arePostsLoading, getRecords} = useStaticRecordsQuery({
    pageSize: 200,
    filter: Q.and(Q.type(PostRecord), Q.author(profileEntity)),
    proxyTo: profileEntity,
  });

  const getPostVersions = useCallback(() => {
    return getRecords().map(Record.toVersionHash);
  }, [getRecords]);

  //
  // Actions.
  //

  const onFollowClick = useCallback(() => {
    const entityRecord = getEntityRecord();
    const subscriptionRecord = getSubscriptionRecord();
    if (
      !entityRecord ||
      subscriptionRecord ||
      entityRecord.author.entity === entity
    ) {
      return;
    }

    const newSubscriptionRecord = PostRecord.subscribe(
      entity,
      entityRecord.author.entity,
      {readPermissions: "public"}
    );
    updateRecords([newSubscriptionRecord]);
  }, [entity, getEntityRecord, getSubscriptionRecord, updateRecords]);

  const onUnfollowClick = useCallback(() => {
    const entityRecord = getEntityRecord();
    const subscriptionRecord = getSubscriptionRecord();
    if (!entityRecord || !subscriptionRecord) {
      return;
    }

    const deletedRecord = Record.delete(entity, subscriptionRecord);
    updateRecords([deletedRecord]);
  }, [getEntityRecord, getSubscriptionRecord, entity, updateRecords]);

  return {
    getProfile,
    getFull,
    isFullLoading,
    getPostVersions,
    arePostsLoading,
    onFollowClick,
    onUnfollowClick,
    wrap: wrapInProxyStore(profileEntity),
  };
}
