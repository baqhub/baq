const isVsCodeExtension = new Error().stack.includes("vscode-tailwindcss");
const presets = isVsCodeExtension ? undefined : [require("nativewind/preset")];

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets,
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    fontSize: {
      sm: ["15px", "20px"],
      base: ["17px", "22px"],
      lg: ["20px", "25px"],
      xl: "1.25rem",
      "2xl": "1.563rem",
      "3xl": "1.953rem",
      "4xl": "2.441rem",
      "5xl": "3.052rem",
    },
    extend: {},
  },
  plugins: [],
};
