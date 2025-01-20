import {Constants} from "../../helpers/constants";
import {AccountPath} from "./accountPath";

export interface AccountState {
  id: string;
  path: AccountPath;
  entity: string;
  entityRecordId: string;
}

function toEntityRecordPath(state: AccountState) {
  return `https://${Constants.domain}${Constants.baqRoutePrefix}/${state.id}/records/${state.entity}/${state.entityRecordId}`;
}

export const AccountState = {
  toEntityRecordPath,
};
