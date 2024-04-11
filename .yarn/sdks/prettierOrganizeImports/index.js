const {existsSync} = require("fs");
const {createRequire} = require("module");
const {resolve} = require("path");

const relPnpApiPath = "../../../.pnp.cjs";

const absPnpApiPath = resolve(__dirname, relPnpApiPath);
const absRequire = createRequire(absPnpApiPath);

if (existsSync(absPnpApiPath)) {
  if (!process.versions.pnp) {
    // Setup the environment to be able to require prettier
    require(absPnpApiPath).setup();
  }
}

module.exports = absRequire("prettier-plugin-organize-imports");
