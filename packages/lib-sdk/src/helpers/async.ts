import {CustomError} from "./customError.js";

export class AbortedError extends CustomError {
  constructor() {
    super("Process aborted.");
  }
}

function throwIfAborted(signal: AbortSignal) {
  if (!signal.aborted) {
    return;
  }

  throw new AbortedError();
}

function delay(delayMilliseconds: number, abort?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const onAbortRequested = () => {
      abort?.removeEventListener("abort", onAbortRequested);
      clearTimeout(timeoutId);
      reject(new AbortedError());
    };

    const timeoutId = setTimeout(() => {
      resolve();
      abort?.removeEventListener("abort", onAbortRequested);
    }, delayMilliseconds);

    abort?.addEventListener("abort", onAbortRequested);
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

  const onAbortRequested = () => {
    if (--waitersCount > 0) {
      return;
    }

    controller.abort();
  };

  const getPromise = () => {
    if (promise) {
      return promise;
    }

    promise = promiseCreator(controller.signal);
    return promise;
  };

  return async (signal?: AbortSignal) => {
    waitersCount++;
    signal?.addEventListener("abort", onAbortRequested);
    const result = await getPromise();
    signal?.removeEventListener("abort", onAbortRequested);
    signal?.throwIfAborted();
    waitersCount--;
    return result;
  };
}

export const Async = {
  throwIfAborted,
  delay,
  wait,
  sharePromise,
};
