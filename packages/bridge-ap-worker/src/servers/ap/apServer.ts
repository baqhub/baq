import {Client, Entity, IO} from "@baqhub/sdk";
import {createFederation, Person} from "@fedify/fedify";
import {Constants} from "../../helpers/constants";
import {CloudflareKvStore} from "../../services/kvStore/cloudflareKvStore/cloudflareKvStore";

function ofEnv(env: Env) {
  const federation = createFederation<void>({
    kv: CloudflareKvStore.ofNamespace(env.KV_WORKER_BRIDGE_AP),
  });

  federation.setActorDispatcher(
    `${Constants.apRoutePrefix}/users/{identifier}`,
    async (ctx, identifier) => {
      // Validate the entity.
      const entity = IO.tryDecode(Entity, identifier);
      if (!entity) {
        return null;
      }

      // Fetch the entity record.
      const client = await Client.discover(entity, ctx.request.signal);
      const {author, content} = await client.getEntityRecord(
        ctx.request.signal
      );

      // Build the actor.
      const name = content.profile.name || author.entity;
      const summary = content.profile.bio;

      return new Person({
        id: ctx.getActorUri(author.entity),
        name,
        summary,
        preferredUsername: author.entity,
        url: new URL("/", ctx.url),
      });
    }
  );

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
