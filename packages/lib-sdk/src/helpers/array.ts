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

export const Array = {
  intersperse,
  randomItem,
};
