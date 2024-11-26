import "temporal-polyfill/global";

import {configure, getConsoleSink} from "@logtape/logtape";
import {Constants} from "./helpers/constants";
import {lazy} from "./helpers/lazy";
import {Responses} from "./helpers/responses";
import {ApServer} from "./servers/ap/apServer";

//
// Logging.
//

await configure({
  sinks: {console: getConsoleSink()},
  filters: {},
  loggers: [
    {category: ["logtape", "meta"], sinks: []},
    {category: "fedify", sinks: ["console"], lowestLevel: "info"},
    {category: "bridge", sinks: ["console"], lowestLevel: "info"},
  ],
});

//
// Shared resources.
//

const apServerOfEnv = lazy(ApServer.ofEnv);

//
// HTTP server.
//

export default {
  async fetch(request, env, _ctx) {
    const url = new URL(request.url);

    // AP Server.
    if (
      url.pathname.startsWith(Constants.apRoutePrefix) ||
      url.pathname.startsWith("/.well-known")
    ) {
      return apServerOfEnv(env).fetch(request);
    }

    // TODO: BAQ Server.

    return Responses.notFound();
  },
} satisfies ExportedHandler<Env>;
