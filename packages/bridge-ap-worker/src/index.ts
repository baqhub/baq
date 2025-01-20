import "temporal-polyfill/global";

import {
  configure,
  getConsoleSink,
  LoggerConfig,
  LogLevel,
} from "@logtape/logtape";
import {Constants} from "./helpers/constants";
import {lazy} from "./helpers/lazy";
import {Responses} from "./helpers/responses";
import {ApServer} from "./servers/ap/apServer";
import {BaqServer} from "./servers/baq/baqServer";

//
// Shared resources.
//

const setupLogging = lazy(async (env: Env) => {
  const level: LogLevel = env.IS_DEV ? "info" : "error";

  const loggers: LoggerConfig<"console", never>[] = [
    {category: ["logtape", "meta"], sinks: []},
    {category: "fedify", sinks: ["console"], level},
    {category: "bridge", sinks: ["console"], level},
  ];

  await configure({
    sinks: {console: getConsoleSink()},
    filters: {},
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
    if (url.pathname.startsWith(Constants.baqRoutePrefix)) {
      return baqServerOfEnv(env).fetch(request);
    }

    return Responses.notFound();
  },
} satisfies ExportedHandler<Env>;
