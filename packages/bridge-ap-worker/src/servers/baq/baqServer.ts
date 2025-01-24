import {Hash, never} from "@baqhub/sdk";
import {
  BlobRequest,
  EntityRequestHandler,
  Server,
  StreamDigester,
} from "@baqhub/server";
import {fetchDocumentLoader} from "@fedify/fedify";
import {isActor, lookupObject} from "@fedify/fedify/vocab";
import {stripHtml} from "string-strip-html";
import {Constants} from "../../helpers/constants";
import {CloudflareBlob} from "../../services/blob/cloudflareBlob";
import {CloudflareKv} from "../../services/kv/cloudflareKv";
import {BaqActor} from "./baqActor";

function patchedDocumentLoader(url: string) {
  return fetchDocumentLoader(url, true);
}

const mastodonSocialRegexp = /^([a-z0-9\\-]{1,60}).mastodon./;
const threadsRegexp = /^([a-z0-9\\-]{1,60}).threads./;
const blueskyRegexp = /^([a-z0-9\\-]{1,60}).bsky./;

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
      return `${actor.username}.mastodon.${Constants.domain}`;

    case "threads.net":
      return `${actor.username}.threads.${Constants.domain}`;

    case "bsky.brid.gy":
      return `${actor.username}.bsky.${Constants.domain}`;

    default:
      throw never();
  }
}

function ofEnv(env: Env) {
  const kv = CloudflareKv.ofNamespace(env.KV_WORKER_BRIDGE_AP);
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

      const {url, mediaType} = icon;

      const fileName = (() => {
        switch (mediaType) {
          case "image/jpeg":
            return "avatar.jpg";

          case "image/png":
            return "avatar.png";

          default:
            return undefined;
        }
      })();

      if (!(url instanceof URL) || !mediaType || !fileName) {
        return undefined;
      }

      const response = await fetch(url);
      if (response.status !== 200 || !response.body) {
        return undefined;
      }

      return {
        fileName,
        type: mediaType,
        stream: response.body,
        context: {url: url.toString()},
      };
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

  const server = Server.new({
    domain: Constants.domain,
    basePath: Constants.baqRoutePrefix,
    onEntityRequest,
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
