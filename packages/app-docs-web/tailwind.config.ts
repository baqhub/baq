import type {Config} from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme.js";

export default {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
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
      ...defaultTheme.screens,
      xl: "1200px",
    },
  },
} satisfies Config;
