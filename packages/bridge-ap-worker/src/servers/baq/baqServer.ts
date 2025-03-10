import {Hash} from "@baqhub/sdk";
import {isActor, lookupObject} from "@fedify/fedify";
import {Hono} from "hono";
import {Constants} from "../../helpers/constants.js";
import {patchedDocumentLoader} from "../../helpers/fedify.js";
import {ActorIdentity} from "../../model/actorIdentity.js";
import {PodMappingObjectStore} from "./baqPodMappingObject.js";
import {PodObjectStore} from "./baqPodObject.js";

// function patchedDocumentLoader(url: string) {
//   return fetchDocumentLoader(url, true);
// }

// const mastodonSocialRegexp = /^([a-z0-9\\-]{1,60})-mastodon-social./;
// const threadsRegexp = /^([a-z0-9\\-]{1,60})-threads-net./;
// const blueskyRegexp = /^([a-z0-9\\-]{1,60})-bsky-social./;
// const blueskyCustomRegexp = /^([a-z0-9\\-]{1,60})-bsky./;

// interface ActorIdentity {
//   server: string;
//   handle: string;
//   entity: string;
// }

// function normalizeHandle(handle: string) {
//   return handle.replace(/--|-/g, m => (m === "--" ? "-" : "."));
// }

// function parseEntity(entity: string): ActorIdentity | undefined {
//   function tryMatch(
//     regex: RegExp,
//     server: string,
//     handleSuffix: string,
//     entitySuffix: string
//   ): ActorIdentity | undefined {
//     const match = entity.match(regex);
//     if (!match || !match[1]) {
//       return undefined;
//     }

//     return {
//       server,
//       handle: normalizeHandle(match[1]) + handleSuffix,
//       entity: match[1] + entitySuffix,
//     };
//   }

//   return (
//     tryMatch(
//       mastodonSocialRegexp,
//       "mastodon.social",
//       "",
//       `-mastodon-social.${Constants.domain}`
//     ) ||
//     tryMatch(
//       threadsRegexp,
//       "threads.net",
//       "",
//       `-threads-net.${Constants.domain}`
//     ) ||
//     tryMatch(
//       blueskyRegexp,
//       "bsky.brid.gy",
//       ".bsky.social",
//       `-bsky-social.${Constants.domain}`
//     ) ||
//     tryMatch(
//       blueskyCustomRegexp,
//       "bsky.brid.gy",
//       "",
//       `-bsky.${Constants.domain}`
//     )
//   );
// }

function ofEnv(env: Env) {
  const routes = new Hono();
  const podMappings = PodMappingObjectStore.new(env.BAQ_POD_MAPPING_OBJECT);
  const pods = PodObjectStore.new(env.BAQ_POD_OBJECT);

  const resolvePodId = async (requestEntity: string) => {
    const podId = await podMappings.get(requestEntity);
    if (podId) {
      return podId;
    }

    const identity = ActorIdentity.ofEntity(Constants.domain, requestEntity);
    if (!identity) {
      return undefined;
    }

    const identifier = ActorIdentity.toIdentifier(identity);
    const actor = await lookupObject(identifier, {
      documentLoader: patchedDocumentLoader,
    });
    if (
      !isActor(actor) ||
      !actor.id ||
      actor.preferredUsername !== identity.handle
    ) {
      return undefined;
    }

    const newPodId = Hash.shortHash(actor.id.toString());
    await pods.initialize(newPodId, requestEntity);

    return newPodId;

    //   const avatar = await (async (): Promise<BlobBuilder | undefined> => {
    //     const icon = await actor.getIcon();
    //     if (!icon) {
    //       return undefined;
    //     }

    //     return avatarToBlobRequest(env, icon);
    //   })();

    //   return {
    //     podId: Hash.shortHash(newActor.id),
    //     entity,
    //     name: actor.name?.toString() || undefined,
    //     bio: stripHtml(actor.summary?.toString() || "").result || undefined,
    //     website: actor.url?.toString() || undefined,
    //     avatar,
    //     createdAt: actor.published
    //       ? new Date(actor.published.epochMilliseconds)
    //       : undefined,
    //     context: newActor,
    //   };
  };

  routes.get("/", async c => {
    const url = new URL(c.req.url);
    const entity = env.IS_DEV
      ? "arstechnica-mastodon-social.baq.lol"
      : url.hostname;

    const podId = await resolvePodId(entity);
    if (!podId) {
      return c.notFound();
    }

    return pods.fetch(podId, c.req.raw);
  });

  routes.all(`${Constants.baqRoutePrefix}/:podId/*`, c => {
    const {podId} = c.req.param();
    return pods.fetch(podId, c.req.raw);
  });

  return {
    fetch: routes.fetch,
  };
}

export const BaqServer = {
  ofEnv,
};
