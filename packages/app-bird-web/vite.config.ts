import {baseConfig} from "@baqhub/config-web/vite.config.base.js";
import mdx from "@mdx-js/rollup";
import smartypants from "remark-smartypants";
import {defineConfig} from "vite";

export default defineConfig({
  ...baseConfig,
  server: {
    port: 5179,
  },
  plugins: [
    {
      enforce: "pre",
      ...mdx({
        providerImportSource: "@mdx-js/react",
        remarkPlugins: [smartypants],
      }),
    },
    ...(baseConfig.plugins || []),
  ],
});
