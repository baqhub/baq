const {existsSync} = require("fs");
const {createRequire} = require("module");
const {resolve} = require("path");

const relPnpApiPath = "./.pnp.cjs";

const absPnpApiPath = resolve(__dirname, relPnpApiPath);
const absRequire = createRequire(absPnpApiPath);

if (existsSync(absPnpApiPath)) {
  if (!process.versions.pnp) {
    // Setup the environment to be able to require prettier
    require(absPnpApiPath).setup();
  }
}

/** @type {import("prettier").Config} */
const config = {
  printWidth: 80,
  bracketSpacing: false,
  arrowParens: "avoid",
  trailingComma: "es5",
  tailwindFunctions: ["tiwi"],
  tailwindPreserveWhitespace: true,
  plugins: [absRequire.resolve("prettier-plugin-organize-imports")],
};

module.exports = config;
