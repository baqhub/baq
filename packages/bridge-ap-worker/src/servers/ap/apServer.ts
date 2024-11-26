import {Client, Entity, IO} from "@baqhub/sdk";
import {createFederation, Image, Person} from "@fedify/fedify";
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

        const avatarUrl = await client.getBlobUrl(entityRecord, avatar, signal);
        return new Image({
          url: new URL(avatarUrl),
          mediaType: avatar.type,
        });
      })();

      return new Person({
        id: ctx.getActorUri(author.entity),
        name,
        summary,
        preferredUsername: author.entity,
        url,
        icon,
        published: createdAt.toTemporalInstant(),
        manuallyApprovesFollowers: false,
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
