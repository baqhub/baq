export type Handler = () => void;
export type HandlerOf<T> = (arg: T) => void;

export type Predicate = () => boolean;
export type PredicateOf<T> = (arg: T) => boolean;

export interface Dictionary<T> {
  [K: string]: T;
}

export function noop() {
  // Do nothing.
}

export function unreachable(_x: never): never {
  throw new Error("Unreachable: this should not happen.");
}

export function isDefined<T>(value: T | undefined): value is T {
  return typeof value !== "undefined";
}

export function isDefinedOr<T>(value: T | undefined, backup: T) {
  return isDefined(value) ? value : backup;
}

export function isPromise(value: unknown) {
  return Boolean(
    value &&
      typeof value === "object" &&
      "then" in value &&
      typeof value.then === "function" &&
      "catch" in value &&
      typeof value.catch === "function"
  );
}

export type IsUnion<T, U extends T = T> = (
  T extends any ? (U extends T ? false : true) : never
) extends false
  ? false
  : true;

type Expand<T> = T extends Date
  ? T
  : T extends object
    ? {[K in keyof T]: Expand<T[K]>}
    : T;

type AllKeys<T> = T extends unknown ? keyof T : never;
export type ExclusiveUnion<
  T,
  K extends PropertyKey = AllKeys<T>,
> = T extends unknown
  ? Expand<T & {[P in Exclude<K, keyof T>]?: never}>
  : never;
