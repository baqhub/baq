import * as IO from "../helpers/io.js";

function findAtPointer<T>(
  type: IO.Type<T, unknown, unknown>,
  obj: unknown,
  pointer: string
): T | undefined {
  const pointerParts = pointer.split("/").slice(1);
  let currentObj = obj;

  for (const pointerPart of pointerParts) {
    if (
      typeof currentObj !== "object" ||
      !currentObj ||
      !(pointerPart in currentObj)
    ) {
      return undefined;
    }

    currentObj = (currentObj as any)[pointerPart];
  }

  return IO.tryDecode(type, currentObj);
}

export const JSONPointer = {
  find: findAtPointer,
};
