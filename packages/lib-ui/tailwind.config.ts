import {baseConfig} from "@baqhub/config-web/tailwind.config.base.js";
import type {Config} from "tailwindcss";

export default {
  ...baseConfig,
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
} satisfies Config;
