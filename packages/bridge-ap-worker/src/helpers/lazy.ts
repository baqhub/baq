export function lazy<A extends Array<any>, R>(func: (...args: A) => R) {
  let result: R;
  return (...args: A) => {
    if (typeof result !== "undefined") {
      return result;
    }

    result = func(...args);
    return result;
  };
}
