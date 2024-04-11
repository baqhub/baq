import {baseConfig} from "@baqhub/config-web/tailwind.config.base.js";
import type {Config} from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme.js";

export default {
  ...baseConfig,
  theme: {
    ...baseConfig.theme,
    extend: {
      ...baseConfig.theme.extend,
      fontFamily: {
        ...baseConfig.theme.extend.fontFamily,
        mono: ["Fira Code VF", ...defaultTheme.fontFamily.mono],
      },
    },
  },
} satisfies Config;
