import {useRecordHelpers} from "../../baq/store.js";

export function useProfilePageState(requestedEntity: string) {
  const {entity} = useRecordHelpers();
  return {isUser: entity === requestedEntity};
}
