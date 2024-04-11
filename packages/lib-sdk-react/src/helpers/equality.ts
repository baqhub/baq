export function isReferenceEqual<T>(a: T, b: T) {
  if (a === b) {
    return a !== 0 || b !== 0 || 1 / (a as any) === 1 / (b as any);
  } else {
    return a !== a && b !== b;
  }
}

export function isShallowEqual<T>(a: T, b: T) {
  if (isReferenceEqual(a, b)) {
    return true;
  }

  if (
    typeof a !== "object" ||
    a === null ||
    typeof b !== "object" ||
    b === null
  ) {
    return false;
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) {
    return false;
  }

  for (let i = 0; i < keysA.length; i++) {
    if (
      !Object.prototype.hasOwnProperty.call(b, keysA[i]!) ||
      !isReferenceEqual((a as any)[keysA[i]!], (b as any)[keysA[i]!])
    ) {
      return false;
    }
  }

  return true;
}
