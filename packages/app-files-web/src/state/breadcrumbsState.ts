import {useCallback} from "react";
import {useRecordByKey} from "../baq/store.js";
import {useHomeContext} from "./homeState.js";

export function useBreadcrumbsState() {
  const {navigation, isLoading, onFolderClick} = useHomeContext();

  const currentKey = navigation[navigation.length - 1];
  const parentKey = navigation[navigation.length - 2];

  const parentRecord = useRecordByKey(parentKey);
  const currentRecord = useRecordByKey(currentKey);

  const onPreviousClick = useCallback(() => {
    if (isLoading) {
      return;
    }

    onFolderClick(parentKey);
  }, [isLoading, parentKey, onFolderClick]);

  return {
    breadcrumbsCount: navigation.length,
    parentName: parentRecord?.content.name,
    currentName: currentRecord?.content.name,
    onPreviousClick,
  };
}
