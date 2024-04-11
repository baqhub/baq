/** @type {import("prettier").Config} */
const config = {
  printWidth: 80,
  bracketSpacing: false,
  arrowParens: "avoid",
  trailingComma: "es5",
  plugins: [__dirname + "/.yarn/sdks/prettierOrganizeImports/index.js"],
};

module.exports = config;
