import {HandlerOf} from "./type.js";

export interface CompletionSource<T = void> {
  promise: Promise<T>;
  resolve: HandlerOf<T>;
  reject: (error?: any) => void;
}

function buildCompletionSource<T = void>(): CompletionSource<T> {
  let resolve: HandlerOf<T>;
  let reject: (error?: any) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return {
    promise,
    resolve: resolve!,
    reject: reject!,
  };
}

export const CompletionSource = {
  new: buildCompletionSource,
};
