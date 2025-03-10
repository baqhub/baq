import "temporal-polyfill/global";

import {
  configure,
  getConsoleSink,
  LoggerConfig,
  LogLevel,
} from "@logtape/logtape";
import {Constants} from "./helpers/constants.js";
import {lazy} from "./helpers/lazy.js";
import {Responses} from "./helpers/responses.js";
import {ApServer} from "./servers/ap/apServer.js";
import {BaqServer} from "./servers/baq/baqServer.js";

export {BaqPodMappingObject} from "./servers/baq/baqPodMappingObject.js";
export {BaqPodObject} from "./servers/baq/baqPodObject.js";

//
// Shared resources.
//

const setupLogging = lazy(async (env: Env) => {
  const level: LogLevel = env.IS_DEV ? "debug" : "error";

  const loggers: LoggerConfig<"console", never>[] = [
    {category: ["logtape", "meta"], sinks: []},
    {category: "fedify", sinks: ["console"], level},
    {category: "bridge", sinks: ["console"], level},
  ];

  await configure({
    sinks: {console: getConsoleSink()},
    loggers,
  });
});

const apServerOfEnv = lazy(ApServer.ofEnv);
const baqServerOfEnv = lazy(BaqServer.ofEnv);

//
// HTTP server.
//

export default {
  async fetch(request, env, _ctx) {
    await setupLogging(env);
    const url = new URL(request.url);

    // AP Server.
    if (
      url.pathname.startsWith(Constants.apRoutePrefix) ||
      url.pathname.startsWith("/.well-known")
    ) {
      return apServerOfEnv(env).fetch(request);
    }

    // BAQ Server.
    if (
      url.pathname === "/" ||
      url.pathname.startsWith(Constants.baqRoutePrefix)
    ) {
      return baqServerOfEnv(env).fetch(request);
    }

    return Responses.notFound();
  },
} satisfies ExportedHandler<Env>;
