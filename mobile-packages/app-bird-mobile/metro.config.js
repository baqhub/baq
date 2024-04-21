/* eslint-disable @typescript-eslint/no-var-requires */
// Learn more https://docs.expo.io/guides/customizing-metro
const {getDefaultConfig} = require("expo/metro-config");
const {withNativeWind} = require("nativewind/metro");
const path = require("path");
const projectRoot = __dirname;

/** @type {import('expo/metro-config').MetroConfig} */
const baseConfig = getDefaultConfig(projectRoot, {isCSSEnabled: true});

/** @type {import('expo/metro-config').MetroConfig} */
const config = {
  ...baseConfig,
  watchFolders: [
    path.resolve(projectRoot, "../../packages/lib-sdk"),
    path.resolve(projectRoot, "../../packages/lib-sdk-react"),
    path.resolve(projectRoot, "../../packages/lib-sdk-react-native"),
    path.resolve(projectRoot, "../../packages/lib-sdk-expo"),
    path.resolve(projectRoot, "../../packages/app-bird-shared"),
    projectRoot,
  ],
  resolver: {
    ...baseConfig.resolver,
    nodeModulesPaths: [path.resolve(projectRoot, "node_modules")],
    blockList: [/build\/esm\/package.json/g, /build\/cjs\/package.json/g],
  },
};

module.exports = withNativeWind(config, {
  input: "./src/style/index.css",
  inlineRem: 16,
});
