/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest/presets/default-esm", // or other ESM presets
  resolver: "ts-jest-resolver",
  modulePathIgnorePatterns: ["<rootDir>/build/"],
};
