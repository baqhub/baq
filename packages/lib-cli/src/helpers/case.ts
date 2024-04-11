import startCase from "lodash/startCase.js";

export function pascalCase(value: string) {
  return startCase(value).replaceAll(" ", "");
}
