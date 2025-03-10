import {JSONPath} from "jsonpath-plus";
import snakeCase from "lodash/snakeCase.js";

export function normalizePath(path: string) {
  function mapPathElement(element: string) {
    const transformed = snakeCase(element);
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
