import {
  EntityRecord,
  Q,
  Record,
  StandingDecision,
  SubscriptionRecord,
} from "@baqhub/sdk";
import {useCallback} from "react";
import {PostRecord} from "../../baq/postRecord.js";
import {
  useFindStandingDecision,
  useRecordHelpers,
  useRecordQuery,
  useStaticRecordQuery,
  useStaticRecordsQuery,
  wrapInProxyStore,
} from "../../baq/store.js";

export const otherProfileRefreshInterval = 60 * 1000; // 1 min.

export interface OtherProfileData {
  isProxy: boolean;
  entity: string;
  name: string | undefined;
  bio: string | undefined;
}

export interface OtherFullProfileData extends OtherProfileData {
  isSubscribed: boolean;
  isBlocked: boolean;
}

export function useOtherProfilePageState(profileEntity: string) {
  const {entity, updateRecords, updateStandingDecision} = useRecordHelpers();

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

  const {getRecord: getEntityRecord} = useStaticRecordQuery(
    {
      filter: Q.and(Q.type(EntityRecord), Q.author(profileEntity)),
      includeLinks: ["standing"],
      proxyTo: profileEntity,
    },
    {refreshMode: "sync", refreshInterval: otherProfileRefreshInterval}
  );

  const get = useCallback((): OtherProfileData | undefined => {
    const entityRecord = getEntityRecord();
    if (!entityRecord) {
      return undefined;
    }

    return {
      isProxy: entityRecord.source === "proxy",
      entity: entityRecord.author.entity,
      name: entityRecord.content.profile.name,
      bio: entityRecord.content.profile.bio,
    };
  }, [getEntityRecord]);

  const decision = useFindStandingDecision(profileEntity);
  const getFull = useCallback((): OtherFullProfileData | undefined => {
    const profile = get();
    const subscriptionRecord = getSubscriptionRecord();

    if (!profile || profile.entity === entity) {
      return undefined;
    }

    return {
      ...profile,
      isSubscribed: Boolean(subscriptionRecord),
      isBlocked: decision === StandingDecision.BLOCK,
    };
  }, [get, getSubscriptionRecord, entity, decision]);

  const {
    isLoading: arePostsLoading,
    getRecords,
    isLoadingMore,
    loadMore,
  } = useStaticRecordsQuery(
    {
      pageSize: 5,
      filter: Q.and(Q.type(PostRecord), Q.author(profileEntity)),
      proxyTo: profileEntity,
    },
    {refreshMode: "sync", refreshInterval: otherProfileRefreshInterval}
  );

  const getPostVersions = useCallback(() => {
    return getRecords().map(Record.toVersionHash);
  }, [getRecords]);

  //
  // Actions.
  //

  const onFollowClick = useCallback(() => {
    const entityRecord = getEntityRecord();
    const subscriptionRecord = getSubscriptionRecord();
    if (!entityRecord || subscriptionRecord) {
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

  const onBlockClick = useCallback(() => {
    const entityRecord = getEntityRecord();
    if (!entityRecord) {
      return;
    }

    updateStandingDecision(entityRecord.author.entity, StandingDecision.BLOCK);
  }, [getEntityRecord, updateStandingDecision]);

  const onUnblockClick = useCallback(() => {
    const entityRecord = getEntityRecord();
    if (!entityRecord) {
      return;
    }

    updateStandingDecision(entityRecord.author.entity, StandingDecision.ALLOW);
  }, [getEntityRecord, updateStandingDecision]);

  return {
    get,
    getFull,
    isFullLoading,
    arePostsLoading,
    isLoadingMore,
    loadMore,
    getPostVersions,
    onFollowClick,
    onUnfollowClick,
    onBlockClick,
    onUnblockClick,
    wrap: wrapInProxyStore(profileEntity),
  };
}
