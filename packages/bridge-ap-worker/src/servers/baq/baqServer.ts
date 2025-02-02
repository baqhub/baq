import {Hash, isDefined, never} from "@baqhub/sdk";
import {
  BlobRequest,
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
const blueskyRegexp = /^([a-z0-9\\-]{1,60})-bsky./;

type ActorPath = [string, string];

function parseEntity(entity: string): ActorPath | undefined {
  function tryMatch(regex: RegExp, server: string): ActorPath | undefined {
    const match = entity.match(regex);
    if (!match || !match[1]) {
      return undefined;
    }

    return [server, match[1]];
  }

  return (
    tryMatch(mastodonSocialRegexp, "mastodon.social") ||
    tryMatch(threadsRegexp, "threads.net") ||
    tryMatch(blueskyRegexp, "bsky.brid.gy")
  );
}

function actorToEntity(actor: BaqActor): string {
  switch (actor.server) {
    case "mastodon.social":
      return `${actor.username}-mastodon-social.${Constants.domain}`;

    case "threads.net":
      return `${actor.username}-threads-net.${Constants.domain}`;

    case "bsky.brid.gy":
      return `${actor.username}-bsky.${Constants.domain}`;

    default:
      throw never();
  }
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

  const onEntityRequest: EntityRequestHandler = async (entity: string) => {
    const actorPath = parseEntity(entity);
    if (!actorPath) {
      return undefined;
    }

    const [server, handle] = actorPath;
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

    const avatar = await (async (): Promise<BlobRequest | undefined> => {
      const icon = await actor.getIcon();
      if (!icon) {
        return undefined;
      }

      return await avatarToBlobRequest(env, icon);
    })();

    return {
      podId: Hash.shortHash(newActor.id),
      entity: actorToEntity(newActor),
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
    const {pod, blobFromRequest} = c;
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

    const first = await outbox.getFirst();
    if (!first) {
      return {builders: []};
    }

    const items = traverseCollection(first);

    // Build corresponding records.
    const builders = await Array.fromAsync(
      items,
      async (item): Promise<RecordBuilder | undefined> => {
        if (!(item instanceof Create)) {
          return undefined;
        }

        const note = await item.getObject();
        if (!(note instanceof Note) || !note.id || !note.published) {
          return undefined;
        }

        console.log({note});

        const versionPublished = note.updated || note.published;

        const build = async () => {
          return noteToPostRecord(env, blobFromRequest, pod.entity, note);
        };

        return {
          id: Hash.shortHash(note.id.toString()),
          createdAt: new Date(note.published.epochMilliseconds),
          versionCreatedAt: new Date(versionPublished.epochMilliseconds),
          type: PostRecord,
          build,
        };
      }
    );

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
  });

  return {
    fetch: server.fetch,
  };
}

export const BaqServer = {
  ofEnv,
};
