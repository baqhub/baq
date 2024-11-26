import {Client, Entity, IO} from "@baqhub/sdk";
import {
  createFederation,
  exportJwk,
  Follow,
  generateCryptoKeyPair,
  Image,
  importJwk,
  KvKey,
  Person,
} from "@fedify/fedify";
import {Constants} from "../../helpers/constants";
import {CloudflareKvStore} from "../../services/kvStore/cloudflareKvStore/cloudflareKvStore";

interface KeyPair {
  type: "rsa" | "ed25519";
  privateKey: JsonWebKey;
  publicKey: JsonWebKey;
}

function ofEnv(env: Env) {
  const kv = CloudflareKvStore.ofNamespace(env.KV_WORKER_BRIDGE_AP);
  const federation = createFederation<void>({
    kv,
    kvPrefixes: {
      activityIdempotence: ["fedify", "activityIdempotence"],
      remoteDocument: ["fedify", "remoteDocument"],
      publicKey: ["fedify", "publicKey"],
    },
  });

  //
  // Actor dispatcher.
  //

  federation
    .setActorDispatcher(
      `${Constants.apRoutePrefix}/users/{identifier}`,
      async (ctx, identifier) => {
        // Validate the entity.
        const entity = IO.tryDecode(Entity, identifier);
        if (!entity) {
          return null;
        }

        // Fetch the entity record.
        const {signal} = ctx.request;
        const client = await Client.discover(entity, signal);
        const entityRecord = await client.getEntityRecord(ctx.request.signal);
        const {author, content, createdAt} = entityRecord;
        const {website, avatar} = content.profile;

        // Build the actor.
        const name = content.profile.name || author.entity;
        const summary = content.profile.bio;

        const url = website
          ? new URL(website)
          : new URL(Constants.birdProfilePrefix + author.entity);

        const icon = await (async () => {
          if (!avatar) {
            return undefined;
          }

          const avatarUrl = await client.getBlobUrl(
            entityRecord,
            avatar,
            signal
          );
          return new Image({
            url: new URL(avatarUrl),
            mediaType: avatar.type,
          });
        })();

        const keyPairs = await ctx.getActorKeyPairs(identifier);
        const publicKeys = keyPairs.map(keyPair => keyPair.cryptographicKey);

        return new Person({
          id: ctx.getActorUri(author.entity),
          name,
          summary,
          preferredUsername: author.entity,
          url,
          icon,
          published: createdAt.toTemporalInstant(),
          manuallyApprovesFollowers: false,
          publicKeys,
          inbox: ctx.getInboxUri(identifier),
        });
      }
    )
    .setKeyPairsDispatcher(async (_ctx, identifier) => {
      async function mapKeyPair(keyPair: KeyPair): Promise<CryptoKeyPair> {
        return {
          privateKey: await importJwk(keyPair.privateKey, "private"),
          publicKey: await importJwk(keyPair.publicKey, "public"),
        };
      }

      async function mapKeyPairs(keysPairs: ReadonlyArray<KeyPair>) {
        return Promise.all(keysPairs.map(mapKeyPair));
      }

      //
      // Find existing keys.
      //

      const key: KvKey = ["keypair", identifier];
      const existingKeys = await kv.get<KeyPair[]>(key);
      if (existingKeys) {
        return await mapKeyPairs(existingKeys);
      }

      //
      // If none were found, create new keys.
      //

      const rsaPair = await generateCryptoKeyPair("RSASSA-PKCS1-v1_5");
      const ed25519Pair = await generateCryptoKeyPair("Ed25519");

      const newKeys: ReadonlyArray<KeyPair> = [
        {
          type: "rsa",
          privateKey: await exportJwk(rsaPair.privateKey),
          publicKey: await exportJwk(rsaPair.publicKey),
        },
        {
          type: "ed25519",
          privateKey: await exportJwk(ed25519Pair.privateKey),
          publicKey: await exportJwk(ed25519Pair.publicKey),
        },
      ];

      await kv.set(key, newKeys);
      return [rsaPair, ed25519Pair];
    });

  //
  // Inbox dispatcher.
  //

  federation
    .setInboxListeners(
      `${Constants.apRoutePrefix}/users/{identifier}/inbox`,
      `${Constants.apRoutePrefix}/inbox`
    )
    .on(Follow, async (ctx, follow) => {
      // if (
      //   follow.id == null ||
      //   follow.actorId == null ||
      //   follow.objectId == null
      // ) {
      //   return;
      // }
      // const parsed = ctx.parseUri(follow.objectId);
      // if (parsed?.type !== "actor" || parsed.identifier !== "me") return;
      // const follower = await follow.getActor(ctx);
      // console.debug(follower);
      return undefined;
    });

  function fetch(request: Request) {
    return federation.fetch(request, {contextData: undefined});
  }

  return {
    fetch,
  };
}

export const ApServer = {
  ofEnv,
};
