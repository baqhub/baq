import {JSONPath} from "jsonpath-plus";
import camelCase from "lodash/camelCase.js";
import snakeCase from "lodash/snakeCase.js";

function normalizePathBase(caseFunction: (s: string) => string, path: string) {
  function mapPathElement(element: string) {
    const transformed = caseFunction(element);
    return transformed || element;
  }

  const pathWithStart = (() => {
    if (path.startsWith("$.") || path.startsWith("$[")) {
      return path;
    }

    return `$.${path}`;
  })();

  const pathArray = JSONPath.toPathArray(pathWithStart).map(mapPathElement);
  return JSONPath.toPathString(pathArray);
}

export function normalizePath(path: string) {
  return normalizePathBase(camelCase, path);
}

export function normalizeSnakePath(path: string) {
  return normalizePathBase(snakeCase, path);
}
