import react from "@vitejs/plugin-react-swc";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {UserConfig} from "vite";
import {ViteImageOptimizer} from "vite-plugin-image-optimizer";
import svgr from "vite-plugin-svgr";

const filePath = fileURLToPath(import.meta.url);
const directoryPath = path.dirname(filePath);

export const baseConfig: UserConfig = {
  define: {
    global: "window",
  },
  resolve: {
    alias: {
      "@assets": path.resolve(directoryPath, "../../../../assets"),
    },
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      // Suppress Rollup workers because of "fp-ts".
      onLog(level, log, defaultHandler) {
        if (log.message.includes("/*#__PURE__*/")) {
          return;
        }

        defaultHandler(level, log);
      },
    },
  },
  plugins: [
    svgr({
      svgrOptions: {
        dimensions: false,
        replaceAttrValues: {
          "#FEFEFE": "currentColor",
        },
      },
    }),
    react(),
    ViteImageOptimizer({
      png: {
        quality: 80,
      },
      jpg: {
        quality: 70,
      },
    }),
  ],
};
