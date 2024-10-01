import {CustomError} from "./customError.js";

export class AbortedError extends CustomError {
  constructor() {
    super("Process aborted.");
  }
}

function throwIfAborted(signal: AbortSignal | undefined) {
  if (!signal?.aborted) {
    return;
  }

  throw new AbortedError();
}

function delay(delayMilliseconds: number, abort?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (abort?.aborted) {
      return reject(new AbortedError());
    }

    const onAbortRequested = () => {
      abort?.removeEventListener("abort", onAbortRequested);
      clearTimeout(timeoutId);
      reject(new AbortedError());
    };

    abort?.addEventListener("abort", onAbortRequested);

    const timeoutId = setTimeout(() => {
      resolve();
      abort?.removeEventListener("abort", onAbortRequested);
    }, delayMilliseconds);
  });
}

function wait(signal: AbortSignal) {
  return new Promise<void>(resolve => {
    const onAbort = () => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    };
    signal.addEventListener("abort", onAbort);
  });
}

function sharePromise<T>(promiseCreator: (signal: AbortSignal) => Promise<T>) {
  let promise: Promise<T>;
  let waitersCount = 0;
  const controller = new AbortController();

  const getPromise = () => {
    if (promise) {
      return promise;
    }

    promise = promiseCreator(controller.signal);
    return promise;
  };

  return (signal?: AbortSignal) => {
    return new Promise<T>((resolve, reject) => {
      let aborted = false;

      const cleanup = () => {
        signal?.removeEventListener("abort", onAbort);
        waitersCount--;
      };

      const onAbort = () => {
        aborted = true;
        cleanup();

        if (waitersCount === 0) {
          controller.abort();
        }

        reject(new AbortedError());
      };

      waitersCount++;
      throwIfAborted(signal);
      signal?.addEventListener("abort", onAbort);

      getPromise().then(
        result => {
          if (aborted) {
            return;
          }

          cleanup();
          resolve(result);
        },
        error => {
          if (aborted) {
            return;
          }

          cleanup();
          reject(error);
        }
      );
    });
  };
}

export const Async = {
  throwIfAborted,
  delay,
  wait,
  sharePromise,
};
