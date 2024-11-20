import "temporal-polyfill/global";

import {createFederation, MemoryKvStore, Person} from "@fedify/fedify";
import {configure, getConsoleSink} from "@logtape/logtape";

//
// Logging.
//

await configure({
  sinks: {console: getConsoleSink()},
  filters: {},
  loggers: [
    {category: ["logtape", "meta"], sinks: []},
    {category: "fedify", sinks: ["console"], lowestLevel: "info"},
  ],
});

//
// Fedify.
//

const federation = createFederation<void>({
  kv: new MemoryKvStore(),
});

federation.setActorDispatcher(
  "/users/{identifier}",
  async (ctx, identifier) => {
    // Other than "me" is not found.
    if (identifier !== "me") {
      return null;
    }

    return new Person({
      id: ctx.getActorUri(identifier),
      name: "Me", // Display name
      summary: "This is me!", // Bio
      preferredUsername: identifier, // Bare handle
      url: new URL("/", ctx.url),
    });
  }
);

//
// HTTP server.
//

export default {
  async fetch(request, env, ctx): Promise<Response> {
    return federation.fetch(request, {contextData: undefined});
  },
} satisfies ExportedHandler<Env>;
