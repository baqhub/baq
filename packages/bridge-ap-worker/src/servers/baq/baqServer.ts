import {Hash} from "@baqhub/sdk";
import {isActor, lookupObject} from "@fedify/fedify";
import {Hono} from "hono";
import {Constants} from "../../helpers/constants.js";
import {patchedDocumentLoader} from "../../helpers/fedify.js";
import {ActorIdentity} from "../../model/actorIdentity.js";
import {PodMappingObjectStore} from "./baqPodMappingObject.js";
import {PodObjectStore} from "./baqPodObject.js";

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
