import {EntityRecord, Q, Record} from "@baqhub/sdk";
import {useCallback} from "react";
import {PostRecord} from "../../baq/postRecord.js";
import {
  useStaticRecordQuery,
  useStaticRecordsQuery,
  wrapInProxyStore,
} from "../../baq/store.js";
import {BirdConstants} from "../constants.js";

export interface PublicProfileData {
  entity: string;
  name: string | undefined;
  bio: string | undefined;
}

export function usePublicProfilePageState(profileEntity: string) {
  //
  // Fetch profile.
  //

  const {getRecord: getEntityRecord} = useStaticRecordQuery(
    {
      filter: Q.and(Q.type(EntityRecord), Q.author(profileEntity)),
      includeLinks: ["standing"],
      proxyTo: profileEntity,
    },
    {
      refreshMode: "sync",
      refreshInterval: BirdConstants.unauthenticatedRefreshInterval,
    }
  );

  const get = useCallback((): PublicProfileData | undefined => {
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

  //
  // Fetch records.
  //

  const {
    isLoading: arePostsLoading,
    getRecords,
    isLoadingMore,
    loadMore,
  } = useStaticRecordsQuery(
    {
      pageSize: BirdConstants.listPageSize,
      filter: Q.and(Q.type(PostRecord), Q.author(profileEntity)),
      proxyTo: profileEntity,
    },
    {
      refreshMode: "sync",
      refreshInterval: BirdConstants.unauthenticatedRefreshInterval,
    }
  );

  const getPostVersions = useCallback(() => {
    return getRecords().map(Record.toVersionHash);
  }, [getRecords]);

  return {
    get,
    arePostsLoading,
    isLoadingMore,
    loadMore,
    getPostVersions,
    wrap: wrapInProxyStore(profileEntity),
  };
}
