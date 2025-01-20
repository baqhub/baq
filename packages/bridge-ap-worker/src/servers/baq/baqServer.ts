import {Hash, never, Uuid} from "@baqhub/sdk";
import {Server} from "@baqhub/server";
import {createRestAPIClient} from "masto";
import {Constants} from "../../helpers/constants";
import {CloudflareKv} from "../../services/kv/cloudflareKv";
import {CloudflareKvStore} from "../../services/kvStore/cloudflareKvStore/cloudflareKvStore";
import {AccountPath} from "./accountPath";
import {AccountState} from "./accountState";
import {BaqKvKeys} from "./baqKvKeys";

const mastodonSocialRegexp = /^([a-z0-9\\-]{1,60}).mastodon./;
const threadsRegexp = /^([a-z0-9\\-]{1,60}).threads./;
const blueskyRegexp = /^([a-z0-9\\-]{1,60}).bsky./;

function entityToAccountPath(entity: string): AccountPath | undefined {
  function tryMatch(regex: RegExp, server: string): AccountPath | undefined {
    const match = entity.match(regex);
    if (!match || !match[1]) {
      return undefined;
    }

    return {
      server,
      username: match[1],
    };
  }

  return (
    tryMatch(mastodonSocialRegexp, "mastodon.social") ||
    tryMatch(threadsRegexp, "threads.net") ||
    tryMatch(blueskyRegexp, "bsky.brid.gy")
  );
}

function accountPathToEntity(accountPath: AccountPath): string {
  switch (accountPath.server) {
    case "mastodon.social":
      return `${accountPath.username}.mastodon.${Constants.domain}`;

    case "threads.net":
      return `${accountPath.username}.threads.${Constants.domain}`;

    case "bsky.brid.gy":
      return `${accountPath.username}.bsky.${Constants.domain}`;

    default:
      throw never();
  }
}

function ofEnv(env: Env) {
  const kv = CloudflareKv.ofNamespace(env.KV_WORKER_BRIDGE_AP);
  const kvStore = CloudflareKvStore.ofNamespace(env.KV_WORKER_BRIDGE_AP);

  async function onDiscoverRequest(entity: string) {
    // Parse entity.
    const accountPath = entityToAccountPath(entity);
    if (!accountPath) {
      return undefined;
    }

    // Find existing mapping.
    const existingIdKey = BaqKvKeys.identifierForAccountPath(accountPath);
    const existingId = await kv.get(existingIdKey);

    if (existingId) {
      const existingStateKey = BaqKvKeys.accountForIdentifier(existingId);
      const existingState = await kv.get(existingStateKey);

      return existingState && AccountState.toEntityRecordPath(existingState);
    }

    // Otherwise, discover the account.
    const masto = createRestAPIClient({
      url: `https://${accountPath.server}`,
    });

    const apAccount = await masto.v1.accounts.lookup({
      acct: accountPath.username,
    });
    // TODO: Check what happens when not found.
    if (!apAccount) {
      return undefined;
    }

    const newPath: AccountPath = {
      server: accountPath.server,
      username: apAccount.username,
    };

    const newState: AccountState = {
      id: Hash.shortHash(apAccount.id),
      path: newPath,
      entity: accountPathToEntity(newPath),
      entityRecordId: Uuid.new(),
    };

    const newStateKey = BaqKvKeys.accountForIdentifier(newState.id);
    await kv.set(newStateKey, newState);

    const newIdKey1 = BaqKvKeys.identifierForAccountPath(newPath);
    await kv.set(newIdKey1, newState.id);

    if (!AccountPath.equals(newPath, accountPath)) {
      const newIdKey2 = BaqKvKeys.identifierForAccountPath(accountPath);
      await kv.set(newIdKey2, newState.id);
    }

    return AccountState.toEntityRecordPath(newState);
  }

  async function onEntityRecordRequest(serverUrl: string, accountId: string) {}

  const server = Server.new({
    basePath: Constants.baqRoutePrefix,
    onDiscoverRequest,
  });

  return {
    fetch: server.fetch,
  };
}

export const BaqServer = {
  ofEnv,
};
