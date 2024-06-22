// Inspired by:
// https://github.com/cyberphone/json-canonicalization/blob/master/node-es6/canonicalize.js

import {isDefined} from "./type.js";

function canonicalize(object: unknown): string {
  // Primitive type or "toJSON": use native stringify.
  if (object === null || typeof object !== "object" || "toJSON" in object) {
    return JSON.stringify(object);
  }

  // Array: maintain element order.
  if (Array.isArray(object)) {
    return `[${object.map(canonicalize).join(",")}]`;
  }

  // Object: sort properties.
  const valuesJson = Object.keys(object)
    .filter(key => isDefined((object as any)[key]))
    .sort()
    .map(key => `${JSON.stringify(key)}:${canonicalize((object as any)[key])}`)
    .join(",");

  return `{${valuesJson}}`;
}

export const Canonicalization = {
  canonicalize,
};
