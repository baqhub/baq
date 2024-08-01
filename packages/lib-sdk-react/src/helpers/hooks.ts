import {AbortedError} from "@baqhub/sdk";
import isEqual from "lodash/isEqual.js";
import {
  DependencyList,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";

export function useConstant<T>(builder: () => T) {
  const valueRef = useRef<T>();

  if (!valueRef.current) {
    valueRef.current = builder();
  }

  return valueRef.current;
}

export function useStable<T extends (...args: any[]) => any>(value: T) {
  const valueRef = useRef(value);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  return useCallback((...args: Parameters<T>): ReturnType<T> => {
    return valueRef.current(...args);
  }, []);
}

export function useDeepMemo<TValue>(
  memoFn: () => TValue,
  key: unknown
): TValue {
  const value = useRef<{key: unknown; value: TValue}>();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const result =
    value.current && isEqual(key, value.current.key)
      ? value.current
      : {key, value: memoFn()};

  useEffect(() => {
    value.current = result;
  }, [result]);

  return result.value;
}

export function abortable(worker: (signal: AbortSignal) => Promise<any>) {
  const abort = new AbortController();

  // Catch aborted errors.
  async function effectAsync() {
    try {
      await null;
      await Promise.resolve(worker(abort.signal));
    } catch (error) {
      if (error instanceof AbortedError) {
        return;
      }

      throw error;
    }
  }
  effectAsync();

  return () => {
    abort.abort();
  };
}

export function useAbortable(
  effect: (signal: AbortSignal) => Promise<any>,
  deps?: DependencyList
) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => abortable(effect), deps);
}

export function useUnmountSignal() {
  const abortRef = useRef<AbortController>();
  const abort = (() => {
    const currentAbort = abortRef.current;
    if (currentAbort && !currentAbort.signal.aborted) {
      return currentAbort;
    }

    return new AbortController();
  })();

  useEffect(() => {
    abortRef.current = abort;
    return () => {
      abort.abort();
    };
  }, [abort]);

  return abort.signal;
}

export function useIsMounted() {
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {isMountedRef};
}

export function useImageUrl(blob: Blob) {
  const imageUrl = useMemo(() => URL.createObjectURL(blob), [blob]);
  useEffect(() => () => URL.revokeObjectURL(imageUrl), [imageUrl]);

  return imageUrl;
}

type ContextWrapper = (children: ReactNode) => JSX.Element;

export function useMergeWrap(
  firstWrapper: ContextWrapper,
  ...otherWrappers: ContextWrapper[]
) {
  return useMemo(() => {
    return otherWrappers.reduce((acc, wrapper): ContextWrapper => {
      return children => acc(wrapper(children));
    }, firstWrapper);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstWrapper, ...otherWrappers]);
}
