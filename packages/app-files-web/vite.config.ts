import {baseConfig} from "@baqhub/config-web/vite.config.base.js";
import {defineConfig} from "vite";

export default defineConfig({
  ...baseConfig,
  server: {
    port: 5174,
  },
});
