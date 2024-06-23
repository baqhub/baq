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

export const Async = {
  throwIfAborted,
  delay,
  wait,
};
