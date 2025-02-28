import {Hash, isDefined, Q, Query} from "@baqhub/sdk";
import {
  BlobBuilder,
  EntityRequestHandler,
  RecordBuilder,
  RecordsRequestHandler,
  Server,
  StreamDigester,
} from "@baqhub/server";
import {fetchDocumentLoader} from "@fedify/fedify";
import {
  Create,
  isActor,
  lookupObject,
  Note,
  traverseCollection,
} from "@fedify/fedify/vocab";
import {stripHtml} from "string-strip-html";
import {PostRecord} from "../../baq/postRecord";
import {Constants} from "../../helpers/constants";
import {noteToPostRecord} from "../../helpers/convert";
import {CloudflareBlob} from "../../services/blob/cloudflareBlob";
import {avatarToBlobRequest} from "../../services/blobFetcher";
import {CloudflareKv} from "../../services/kv/cloudflareKv";
import {BaqActor} from "./baqActor";

function patchedDocumentLoader(url: string) {
  return fetchDocumentLoader(url, true);
}

const mastodonSocialRegexp = /^([a-z0-9\\-]{1,60})-mastodon-social./;
const threadsRegexp = /^([a-z0-9\\-]{1,60})-threads-net./;
const blueskyRegexp = /^([a-z0-9\\-]{1,60})-bsky-social./;
const blueskyCustomRegexp = /^([a-z0-9\\-]{1,60})-bsky./;

interface ActorIdentity {
  server: string;
  handle: string;
  entity: string;
}

function normalizeHandle(handle: string) {
  return handle.replace(/--|-/g, m => (m === "--" ? "-" : "."));
}

function parseEntity(entity: string): ActorIdentity | undefined {
  function tryMatch(
    regex: RegExp,
    server: string,
    handleSuffix: string,
    entitySuffix: string
  ): ActorIdentity | undefined {
    const match = entity.match(regex);
    if (!match || !match[1]) {
      return undefined;
    }

    return {
      server,
      handle: normalizeHandle(match[1]) + handleSuffix,
      entity: match[1] + entitySuffix,
    };
  }

  return (
    tryMatch(
      mastodonSocialRegexp,
      "mastodon.social",
      "",
      `-mastodon-social.${Constants.domain}`
    ) ||
    tryMatch(
      threadsRegexp,
      "threads.net",
      "",
      `-threads-net.${Constants.domain}`
    ) ||
    tryMatch(
      blueskyRegexp,
      "bsky.brid.gy",
      ".bsky.social",
      `-bsky-social.${Constants.domain}`
    ) ||
    tryMatch(
      blueskyCustomRegexp,
      "bsky.brid.gy",
      "",
      `-bsky.${Constants.domain}`
    )
  );
}

function ofEnv(env: Env) {
  const kvStoreAdapter = CloudflareKv.ofNamespace(env.KV_WORKER_BRIDGE_AP, [
    "baq_server",
  ]);
  const blobStoreAdapter = CloudflareBlob.ofBucket(env.R2_WORKER_BRIDGE_AP_BAQ);

  const digestStream: StreamDigester = input => {
    // Split the stream.
    // In workers, the implementation is non-standard and follows the slower stream.
    const [stream1, stream2] = input.tee();

    const digester = new crypto.DigestStream("SHA-256");
    stream2.pipeTo(digester);

    // Convert the digest result to a string.
    const hash = digester.digest.then(hashBuffer => {
      return Hash.bytesToHex(new Uint8Array(hashBuffer));
    });

    return {
      output: stream1,
      hash,
    };
  };

  const onEntityRequest: EntityRequestHandler = async (
    requestEntity: string
  ) => {
    const actorIdentity = parseEntity(requestEntity);
    if (!actorIdentity) {
      return undefined;
    }

    const {server, handle, entity} = actorIdentity;
    const identifier = `${handle}@${server}`;

    const actor = await lookupObject(identifier, {
      documentLoader: patchedDocumentLoader,
    });
    if (!isActor(actor)) {
      return undefined;
    }

    console.log({actor});

    const {id, preferredUsername} = actor;
    if (!id || typeof preferredUsername !== "string") {
      return undefined;
    }

    const newActor: BaqActor = {
      id: id.toString(),
      server,
      username: preferredUsername,
    };

    const avatar = await (async (): Promise<BlobBuilder | undefined> => {
      const icon = await actor.getIcon();
      if (!icon) {
        return undefined;
      }

      return avatarToBlobRequest(env, icon);
    })();

    return {
      podId: Hash.shortHash(newActor.id),
      entity,
      name: actor.name?.toString() || undefined,
      bio: stripHtml(actor.summary?.toString() || "").result || undefined,
      website: actor.url?.toString() || undefined,
      avatar,
      createdAt: actor.published
        ? new Date(actor.published.epochMilliseconds)
        : undefined,
      context: newActor,
    };
  };

  const onRecordsRequest: RecordsRequestHandler = async c => {
    const {pod, query, blobFromBuilder} = c;

    // Only serve post record queries.
    const postRecordQuery = Query.new({
      filter: Q.and(Q.type(PostRecord), Q.author(pod.entity)),
    });

    if (!Query.isSuperset(query, postRecordQuery)) {
      return {builders: []};
    }

    const baqActor = pod.context as BaqActor;
    const actor = await lookupObject(baqActor.id, {
      documentLoader: patchedDocumentLoader,
    });

    if (!isActor(actor)) {
      return {builders: []};
    }

    // List notes.
    const outbox = await actor.getOutbox();
    if (!outbox) {
      return {builders: []};
    }

    const pageSize = query.pageSize || 0;

    const buildersIterable = async function* (): AsyncIterable<RecordBuilder> {
      let itemCount = 0;
      let resultCount = 0;

      for await (const item of traverseCollection(outbox)) {
        if (resultCount === pageSize || itemCount === 100) {
          break;
        }

        itemCount++;

        if (!(item instanceof Create)) {
          continue;
        }

        const note = await item.getObject();
        if (!(note instanceof Note) || !note.id || !note.published) {
          continue;
        }

        resultCount++;

        const versionPublished = note.updated || note.published;

        const build = async () => {
          return noteToPostRecord(env, blobFromBuilder, pod.entity, note);
        };

        yield {
          id: Hash.shortHash(note.id.toString()),
          createdAt: new Date(note.published.epochMilliseconds),
          versionCreatedAt: new Date(versionPublished.epochMilliseconds),
          type: PostRecord,
          build,
        };
      }
    };

    // Build corresponding records.
    const builders = await Array.fromAsync(buildersIterable());

    return {builders: builders.filter(isDefined)};
  };

  const server = Server.new({
    domain: Constants.domain,
    basePath: Constants.baqRoutePrefix,
    onEntityRequest,
    onRecordsRequest,
    digestStream,
    kvStoreAdapter,
    blobStoreAdapter,
    isDev: Boolean(env.IS_DEV),
  });

  return {
    fetch: server.fetch,
  };
}

export const BaqServer = {
  ofEnv,
};
