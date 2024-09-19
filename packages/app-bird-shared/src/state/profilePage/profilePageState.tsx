import {useRecordHelpers} from "../../baq/store.js";

export enum ProfilePageMode {
  PUBLIC = "PUBLIC",
  USER = "USER",
  OTHER_USER = "OTHER_USER",
}

export function useProfilePageState(requestedEntity: string) {
  const {isAuthenticated, entity} = useRecordHelpers();
  const mode = (() => {
    if (!isAuthenticated) {
      return ProfilePageMode.PUBLIC;
    }

    if (entity === requestedEntity) {
      return ProfilePageMode.USER;
    }

    return ProfilePageMode.OTHER_USER;
  })();

  return {mode};
}
