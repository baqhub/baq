function intersperse<T>(arr: ReadonlyArray<T>, value: T): ReadonlyArray<T> {
  return arr.reduce((result, item, index) => {
    if (index > 0) {
      result.push(value);
    }

    result.push(item);

    return result;
  }, [] as T[]);
}

function randomItem<T>(array: ReadonlyArray<T>): T {
  const index = Math.floor(Math.random() * array.length);
  return array[index]!;
}

function isSuperset<T>(
  superset: ReadonlyArray<T>,
  subset: ReadonlyArray<T>
): boolean {
  return superset === subset || subset.every(item => superset.includes(item));
}

function arrayFirst<T>(arr: ReadonlyArray<T>): T | undefined {
  return arr[0];
}

function arrayLast<T>(arr: ReadonlyArray<T>): T | undefined {
  return arr[arr.length - 1];
}

export const Array = {
  intersperse,
  randomItem,
  isSuperset,
  first: arrayFirst,
  last: arrayLast,
};
