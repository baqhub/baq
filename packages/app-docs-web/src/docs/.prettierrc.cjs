const baseConfig = require("../../../../.prettierrc.js");

/** @type {import("prettier").Config} */
const config = {
  ...baseConfig,
  printWidth: 66,
};

module.exports = config;