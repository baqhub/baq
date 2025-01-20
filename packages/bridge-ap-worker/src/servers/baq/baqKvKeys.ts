import {KvKey} from "../../services/kv/cloudflareKv";
import {AccountPath} from "./accountPath";
import {AccountState} from "./accountState";

function identifierForAccountPath(account: AccountPath): KvKey<string> {
  return ["baq", "identifier", account.username, account.server];
}

function accountForIdentifier(identifier: string): KvKey<AccountState> {
  return ["baq", "account_state", identifier];
}

export const BaqKvKeys = {
  identifierForAccountPath,
  accountForIdentifier,
};
