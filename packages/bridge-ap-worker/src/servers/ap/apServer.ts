import {
  Client,
  Entity,
  EntityRecord,
  Hash,
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
  Note,
  Person,
  PUBLIC_COLLECTION,
} from "@fedify/fedify";
import {PostRecord} from "../../baq/postRecord";
import {Constants} from "../../helpers/constants";
import {postTextToHtml} from "../../helpers/string";
import {CloudflareKv} from "../../services/kv/cloudflareKv";
import {CloudflareKvStore} from "../../services/kvStore/cloudflareKvStore/cloudflareKvStore";
import {ActorKeyPair, ActorState, ApKvKeys} from "./apKvKeys";

const KnownRecord = IO.union([EntityRecord, StandingRecord, PostRecord]);

function ofEnv(env: Env) {
  const kv = CloudflareKv.ofNamespace(env.KV_WORKER_BRIDGE_AP);
  const kvStore = CloudflareKvStore.ofNamespace(env.KV_WORKER_BRIDGE_AP);

  const federation = createFederation<void>({
    kv: kvStore,
    kvPrefixes: {
      activityIdempotence: ApKvKeys.fedifyActivityIdempotence,
      remoteDocument: ApKvKeys.fedifyRemoteDocument,
      publicKey: ApKvKeys.fedifyPublicKey,
    },
  });

  //
  // Internal state.
  //

  async function findActorId(requestedEntity: string) {
    // Validate the entity.
    const entity = IO.tryDecode(Entity, requestedEntity);
    if (!entity) {
      return null;
    }

    // Find an existing mapping.
    const key = ApKvKeys.identifierForEntity(entity);
    const existingId = await kv.get(key);
    if (existingId) {
      return existingId;
    }

    // Create a new one and store it.
    // TODO: Revisit concurrent scenario.
    const newState: ActorState = {
      id: Hash.shortHash(entity),
      entity,
      entityRecord: undefined,
    };

    await kv.set(ApKvKeys.actorForIdentifier(newState.id), newState);
    await kv.set(key, newState.id);

    return newState.id;
  }

  async function findActorEntityRecord(
    identifier: string,
    signal: AbortSignal
  ) {
    const key = ApKvKeys.actorForIdentifier(identifier);
    const state = await kv.get(key);
    if (!state) {
      return undefined;
    }

    // If we have an entity record, return it.
    if (state.entityRecord) {
      return IO.decode(EntityRecord, state.entityRecord.record);
    }

    // Otherwise, perform discovery.
    const client = await Client.discover(state.entity, signal);
    const entityRecord = await client.getEntityRecord(signal);

    const newState: ActorState = {
      ...state,
      entityRecord: {
        fetchedAt: Date.now(),
        record: IO.encode(EntityRecord, entityRecord),
      },
    };
    await kv.set(key, newState);

    return entityRecord;
  }

  //
  // Actor dispatcher.
  //

  federation
    .setActorDispatcher(
      `${Constants.apRoutePrefix}/users/{identifier}`,
      async (ctx, identifier) => {
        const {signal} = ctx.request;
        const entityRecord = await findActorEntityRecord(identifier, signal);
        if (!entityRecord) {
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

          const client = Client.ofRecord(entityRecord);
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
        if (keyPairs.length === 0) {
          return null;
        }

        return new Person({
          id: ctx.getActorUri(identifier),
          preferredUsername: author.entity,
          name,
          summary,
          url,
          icon,
          published: receivedAt!.toTemporalInstant(),
          manuallyApprovesFollowers: false,
          publicKey: keyPairs[0]!.cryptographicKey,
          assertionMethods: [keyPairs[1]!.multikey],
          outbox: ctx.getOutboxUri(identifier),
          inbox: ctx.getInboxUri(identifier),
          endpoints: new Endpoints({sharedInbox: null}),
        });
      }
    )
    .setKeyPairsDispatcher(async (_ctx, identifier) => {
      async function mapKeyPair(keyPair: ActorKeyPair): Promise<CryptoKeyPair> {
        return {
          privateKey: await importJwk(keyPair.privateKey, "private"),
          publicKey: await importJwk(keyPair.publicKey, "public"),
        };
      }

      async function mapKeyPairs(keysPairs: ReadonlyArray<ActorKeyPair>) {
        return Promise.all(keysPairs.map(mapKeyPair));
      }

      //
      // Find existing keys.
      //

      const key = ApKvKeys.keyPairsForIdentifier(identifier);
      const existingKeys = await kv.get(key);
      if (existingKeys) {
        return await mapKeyPairs(existingKeys);
      }

      //
      // If none were found, create new keys.
      //

      const rsaPair = await generateCryptoKeyPair("RSASSA-PKCS1-v1_5");
      const ed25519Pair = await generateCryptoKeyPair("Ed25519");

      await kv.set(key, [
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
      ]);

      return [rsaPair, ed25519Pair];
    })
    .mapHandle((_ctx, username) => {
      return findActorId(username);
    });

  //
  // Object dispatcher.
  //

  federation.setObjectDispatcher(
    Note,
    `${Constants.apRoutePrefix}/users/{identifier}/notes/{id}`,
    async (ctx, values) => {
      const {signal} = ctx.request;
      const entityRecord = await findActorEntityRecord(
        values.identifier,
        signal
      );
      if (!entityRecord) {
        return null;
      }

      const client = Client.ofRecord(entityRecord);
      const {record} = await client.getRecord(
        KnownRecord,
        PostRecord,
        entityRecord.author.entity,
        values.id
      );

      const {content, receivedAt} = record;
      if (!("text" in content) || !receivedAt) {
        return null;
      }

      return new Note({
        id: ctx.getObjectUri(Note, values),
        url: ctx.getObjectUri(Note, values),
        attribution: ctx.getActorUri(values.identifier),
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
        const entityRecord = await findActorEntityRecord(identifier, signal);
        if (!entityRecord) {
          return null;
        }

        const client = Client.ofRecord(entityRecord);
        const {author} = entityRecord;

        const {records, nextPage} = await (() => {
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
            const {content, receivedAt} = post;
            if (!("text" in content) || !receivedAt) {
              return undefined;
            }

            return new Create({
              id: new URL(
                `${Constants.apRoutePrefix}/users/${identifier}/notes/${post.id}#activity`,
                ctx.url
              ),
              actor: ctx.getActorUri(identifier),
              object: new Note({
                id: ctx.getObjectUri(Note, {identifier, id: post.id}),
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
