interface Result<T> {
  result: T;
}

export function buildFetcher<T>(promiseBuilder: () => Promise<T>) {
  let res: Result<T>;
  const promise = promiseBuilder();

  promise.then(result => (res = {result}));

  return () => {
    if (!res) {
      throw promise;
    }

    return res.result;
  };
}
