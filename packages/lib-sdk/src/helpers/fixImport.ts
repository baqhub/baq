//
// Code from https://github.com/JacobLey/jacobley/blob/main/tools/default-import/src/default-import.ts
// Re-used here to avoid issues with misconfigured package.json in that package.
//

// eslint-disable-next-line @typescript-eslint/naming-convention
type ExtractDefault<T> = T extends {__esModule?: boolean; default: infer U}
  ? // eslint-disable-next-line @typescript-eslint/naming-convention
    U extends {__esModule?: boolean; default: infer V}
    ? V
    : U
  : T;

/**
 * With ESM it is possible to export both a default value and multiple named exports.
 * With CJS it is possible to "mock" ESM functionality with a `__esModule=true` flag
 * but still only export a single "default" export, or multiple named exports.
 *
 * This helper method detects when a library tries to do a "default" export with other named values
 * and returns the "intended" default value.
 *
 * It also handles CJS exports that export an entire object via `module.exports = {}` rather than export syntax,
 * as well as extracting the `default` (if exists) from a dynamic import.
 *
 * Note there is not "namedExport" equivalent because it is assumed module loaders successfully parse that
 * out for both CJS and ESM.
 *
 * @param {*} mod - "default" export that might be wrapped in another layer
 * @returns {*} unwrapped module
 */
export const fixImport = <T>(mod: T): ExtractDefault<T> => {
  if (typeof mod !== "object" || mod === null) {
    return mod as ExtractDefault<T>;
  }

  // Webpack provides a Module tag to match NodeJS' Module module
  const defaultVal =
    Symbol.toStringTag in mod &&
    (mod as unknown as {[Symbol.toStringTag]: string; default: T})[
      Symbol.toStringTag
    ] === "Module"
      ? (mod as unknown as {[Symbol.toStringTag]: "Module"; default?: T})
          .default ?? mod
      : mod;

  if (
    defaultVal instanceof Object &&
    "__esModule" in defaultVal &&
    // eslint-disable-next-line @typescript-eslint/naming-convention
    (defaultVal as unknown as {__esModule?: boolean}).__esModule &&
    (defaultVal as unknown as {default?: ExtractDefault<T> | undefined})
      .default !== undefined
  ) {
    return (defaultVal as unknown as {default: ExtractDefault<T>}).default;
  }

  return defaultVal as ExtractDefault<T>;
};
