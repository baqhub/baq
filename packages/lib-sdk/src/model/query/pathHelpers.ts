import {JSONPath} from "jsonpath-plus";
import snakeCase from "lodash/snakeCase.js";

export function normalizePath(path: string) {
  function mapPathElement(element: string) {
    const transformed = snakeCase(element);
    return transformed || element;
  }

  const pathArray = JSONPath.toPathArray(`$.${path}`).map(mapPathElement);
  return JSONPath.toPathString(pathArray);
}
