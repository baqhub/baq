import {
  Client,
  Entity,
  EntityRecord,
  IO,
  isDefined,
  Q,
  StandingRecord,
  Str,
} from "@baqhub/sdk";
import {
  Create,
  createFederation,
  Endpoints,
  exportJwk,
  Follow,
  generateCryptoKeyPair,
  Image,
  importJwk,
  KvKey,
  Note,
  Person,
  PUBLIC_COLLECTION,
} from "@fedify/fedify";
import {PostRecord} from "../../baq/postRecord";
import {Constants} from "../../helpers/constants";
import {postTextToHtml} from "../../helpers/string";
import {CloudflareKvStore} from "../../services/kvStore/cloudflareKvStore/cloudflareKvStore";

interface KeyPair {
  type: "rsa" | "ed25519";
  privateKey: JsonWebKey;
  publicKey: JsonWebKey;
}

const KnownRecord = IO.union([EntityRecord, StandingRecord, PostRecord]);

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
        if (entity !== entityRecord.author.entity) {
          return null;
        }

        const {author, content, receivedAt} = entityRecord;
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

        const keyPairs = await ctx.getActorKeyPairs(entity);
        if (keyPairs.length === 0) {
          return null;
        }

        return new Person({
          id: ctx.getActorUri(author.entity),
          name,
          summary,
          preferredUsername: author.entity,
          url,
          icon,
          published: receivedAt!.toTemporalInstant(),
          manuallyApprovesFollowers: false,
          publicKey: keyPairs[0]!.cryptographicKey,
          assertionMethods: [keyPairs[1]!.multikey],
          outbox: ctx.getOutboxUri(entity),
          inbox: ctx.getInboxUri(entity),
          endpoints: new Endpoints({sharedInbox: null}),
        });
      }
    )
    .setKeyPairsDispatcher(async (_ctx, identifier) => {
      const entity = IO.tryDecode(Entity, identifier);
      if (!entity) {
        return [];
      }

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

      const key: KvKey = ["keypair", entity];
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
  // Object dispatcher.
  //

  federation.setObjectDispatcher(
    Note,
    `${Constants.apRoutePrefix}/users/{identifier}/notes/{id}`,
    async (ctx, values) => {
      const {signal} = ctx.request;
      const entity = IO.tryDecode(Entity, values.identifier);
      if (!entity) {
        return null;
      }

      const client = await Client.discover(entity, signal);
      const {author} = await client.getEntityRecord(signal);
      if (entity !== author.entity) {
        return null;
      }

      const {record, linkedRecords} = await client.getRecord(
        KnownRecord,
        PostRecord,
        entity,
        values.id
      );

      const {content, receivedAt} = record;
      if (!("text" in content) || !receivedAt) {
        return null;
      }

      return new Note({
        id: ctx.getObjectUri(Note, values),
        url: ctx.getObjectUri(Note, values),
        attribution: ctx.getActorUri(entity),
        to: PUBLIC_COLLECTION,
        // cc: ctx.getFollowersUri(entity),
        published: receivedAt.toTemporalInstant(),
        mediaType: "text/html",
        content: postTextToHtml(content.text),
      });
    }
  );

  //
  // Outbox dispatcher.
  //

  federation
    .setOutboxDispatcher(
      `${Constants.apRoutePrefix}/users/{identifier}/outbox`,
      async (ctx, identifier, cursor) => {
        //
        // Fetch post records on BAQ.
        //

        // Validate the entity.
        const {signal} = ctx.request;
        const entity = IO.tryDecode(Entity, identifier);
        if (!entity) {
          return null;
        }

        const client = await Client.discover(entity, signal);
        const {author} = await client.getEntityRecord(signal);
        if (entity !== author.entity) {
          return null;
        }

        const {records, linkedRecords, nextPage} = await (() => {
          // Load more query.
          if (cursor) {
            const nextPage = Str.fromUrlBase64(cursor);
            return client.getMoreRecords(KnownRecord, PostRecord, nextPage);
          }

          // Initial query.
          return client.getRecords(
            KnownRecord,
            PostRecord,
            {
              pageSize: Constants.itemsPerPage,
              filter: Q.and(Q.type(PostRecord), Q.author(author.entity)),
            },
            signal
          );
        })();

        //
        // Convert to activities.
        //

        const items = records
          .map(post => {
            const {author, content, receivedAt} = post;
            if (!("text" in content) || !receivedAt) {
              return undefined;
            }

            return new Create({
              id: new URL(
                `${Constants.apRoutePrefix}/users/${author.entity}/notes/${post.id}#activity`,
                ctx.url
              ),
              actor: ctx.getActorUri(author.entity),
              object: new Note({
                id: ctx.getObjectUri(Note, {
                  identifier: author.entity,
                  id: post.id,
                }),
                published: receivedAt.toTemporalInstant(),
                mediaType: "text/html",
                content: postTextToHtml(content.text),
              }),
            });
          })
          .filter(isDefined);

        const nextCursor = nextPage ? Str.toUrlBase64(nextPage) : null;
        return {items, nextCursor};
      }
    )
    .setCounter(() => 99)
    .setFirstCursor(() => "");

  //
  // Inbox dispatcher.
  //

  federation
    .setInboxListeners(`${Constants.apRoutePrefix}/users/{identifier}/inbox`)
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
