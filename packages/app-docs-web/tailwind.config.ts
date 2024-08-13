import type {Config} from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme.js";

export default {
  darkMode: "class",
  content: [
    "../lib-ui/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/docs/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      screens: {
        "any-hover": {raw: "(any-hover: hover)"},
      },
    },
    fontFamily: {
      sans: ["var(--font-inter)", ...defaultTheme.fontFamily.sans],
      mono: ["var(--font-firacode)", ...defaultTheme.fontFamily.mono],
    },
    screens: {
      sm: defaultTheme.screens.sm,
      md: defaultTheme.screens.md,
      mdp: "930px",
      lg: defaultTheme.screens.lg,
      xl: "1200px",
      "2xl": defaultTheme.screens["2xl"],
    },
  },
} satisfies Config;
