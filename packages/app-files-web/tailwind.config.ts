import type {Config} from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme.js";
import plugin from "tailwindcss/plugin.js";
import {normalize} from "tailwindcss/src/util/dataTypes";
import {default as escapeClassName} from "tailwindcss/src/util/escapeClassName";

export const baseConfig = {
  darkMode: "class",
  content: [
    "../lib-ui/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./index.html",
  ],
  theme: {
    extend: {
      aria: {
        invalid: 'invalid="true"',
      },
      screens: {
        "any-hover": {raw: "(any-hover: hover)"},
      },
      fontFamily: {
        sans: ["Inter var", ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [
    plugin(function ({matchVariant, theme}) {
      matchVariant(
        "adjacent-peer-aria",
        (value, {modifier}) =>
          modifier
            ? `:merge(.peer\\/${modifier})[aria-${normalize(value)}] + &`
            : `:merge(.peer)[aria-${normalize(value)}] + &`,
        {values: theme("aria") ?? {}}
      );
      matchVariant(
        "adjacent",
        (_, {modifier}) =>
          modifier
            ? `:merge(.peer\\/${escapeClassName(modifier)}) + &`
            : `:merge(.peer) + &`,
        {values: {peer: "peer", group: "group"}}
      );
    }),
  ],
} satisfies Config;

export default baseConfig;
