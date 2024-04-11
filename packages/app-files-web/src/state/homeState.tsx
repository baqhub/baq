import {PredicateOf, Q, Record, RecordKey, RecordLink} from "@baqhub/sdk";
import sortBy from "lodash/sortBy.js";
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import {FileRecord} from "../baq/fileRecord.js";
import {FolderRecord} from "../baq/folderRecord.js";
import {
  useRecordByKey,
  useRecordHelpers,
  useRecordQuery,
  useRecordsQuery,
} from "../baq/store.js";

//
// View model.
//

export type Navigation = ReadonlyArray<RecordKey<FolderRecord>>;
export type ItemKey = RecordKey<FolderRecord | FileRecord>;
type NavigateToFolder = (link: RecordKey<FolderRecord> | undefined) => void;

//
// Context.
//

interface HomeContextProps {
  navigation: Navigation;
  folderLink: RecordLink<FolderRecord> | undefined;
  isLoading: boolean;
  isUniqueItemName: PredicateOf<string>;
  onFolderClick: NavigateToFolder;
}

const HomeContext = createContext<HomeContextProps>({
  navigation: [],
  folderLink: undefined,
  isLoading: false,
  isUniqueItemName: () => true,
  onFolderClick: () => {},
});

export function useHomeContext() {
  return useContext(HomeContext);
}

//
// Hook.
//

const parentLinkPath = "content.parent";

function findItemName(item: FolderRecord | FileRecord) {
  if (Record.hasType(item, FolderRecord)) {
    return item.content.name;
  }

  return item.content.blob.name;
}

export function useHomeState() {
  const {entity} = useRecordHelpers();

  //
  // Sync.
  //

  useRecordQuery(
    {
      filter: Q.and(
        Q.author(entity),
        Q.or(Q.type(FolderRecord), Q.type(FileRecord))
      ),
    },
    {mode: "sync"}
  );

  //
  // Navigation.
  //

  const [navigation, setNavigation] = useState<Navigation>([]);
  const folderKey = navigation[navigation.length - 1];
  const folderRecord = useRecordByKey(folderKey);
  const folderLink = folderRecord && Record.toLink(folderRecord);

  //
  // Current folder data.
  //

  const {isLoading, getDeferredRecords} = useRecordsQuery({
    pageSize: 200,
    filter: Q.and(
      Q.author(entity),
      Q.or(Q.type(FolderRecord), Q.type(FileRecord)),
      folderLink
        ? Q.record(parentLinkPath, folderLink)
        : Q.empty(parentLinkPath)
    ),
  });

  const getItemKeys = useCallback(() => {
    return sortBy(getDeferredRecords(), [
      r => !Record.hasType(r, FolderRecord),
      findItemName,
    ]).map(Record.toKey);
  }, [getDeferredRecords]);

  //
  // Context.
  //

  const onFolderClick = useCallback<NavigateToFolder>(folderKey => {
    setNavigation(state => {
      if (!folderKey) {
        return [];
      }

      if (state.includes(folderKey)) {
        const navFolderIndex = state.indexOf(folderKey);
        return state.slice(0, navFolderIndex + 1);
      }

      return [...state, folderKey];
    });
  }, []);

  const isUniqueItemName = useCallback(
    (name: string) => {
      if (isLoading) {
        return false;
      }

      return getDeferredRecords().every(i => findItemName(i) !== name);
    },
    [isLoading, getDeferredRecords]
  );

  const context = useMemo<HomeContextProps>(
    () => ({
      navigation,
      folderLink,
      isLoading,
      isUniqueItemName,
      onFolderClick,
    }),
    [navigation, folderLink, isLoading, isUniqueItemName, onFolderClick]
  );

  const provider = useCallback(
    (content: ReactNode) => {
      return (
        <HomeContext.Provider value={context}>{content}</HomeContext.Provider>
      );
    },
    [context]
  );

  //
  // New file.
  //

  return {
    provider,
    isLoading,
    getItemKeys,
  };
}
