import {chain, isLeft, isRight} from "fp-ts/lib/Either.js";
import {pipe} from "fp-ts/lib/function.js";
import * as t from "io-ts";
import {
  Errors,
  Mixed,
  TypeOf,
  UnionType,
  appendContext,
  failures,
  identity,
  success,
} from "io-ts";
import reporterBase from "io-ts-reporters";
import camelCase from "lodash/camelCase.js";
import isArray from "lodash/isArray.js";
import isNumber from "lodash/isNumber.js";
import isString from "lodash/isString.js";
import map from "lodash/map.js";
import snakeCase from "lodash/snakeCase.js";
import toLower from "lodash/toLower.js";
import {fixImport} from "./fixImport.js";
import {ExclusiveUnion, isDefined} from "./type.js";

export * from "io-ts";
const reporter = fixImport(reporterBase);

//
// Date.
//

export interface ISODate extends t.Type<Date, string, unknown> {}

export const isoDate: ISODate = new t.Type<Date, string, unknown>(
  "DateFromISOString",
  (u): u is Date => u instanceof Date,
  (u, c) =>
    pipe(
      t.string.validate(u, c),
      chain(s => {
        const d = new Date(s);
        return isNaN(d.getTime()) ? t.failure(u, c) : t.success(d);
      })
    ),
  a => a.toISOString()
);

//
// Readonly + Exact + ChangeCase combinator.
//

function getProps(codec: t.HasProps): t.Props {
  switch (codec._tag) {
    case "RefinementType":
    case "ReadonlyType":
      return getProps(codec.type);

    case "InterfaceType":
    case "StrictType":
    case "PartialType":
      return codec.props;

    case "IntersectionType":
      return codec.types.reduce<t.Props>(
        (props, type) => Object.assign(props, getProps(type)),
        {}
      );
  }
}

function getExactWithCaseTypeName(codec: t.Any): string {
  return `ExactWithCase<${codec.name}>`;
}

function prefixAwareCase(transform: (v: string) => string) {
  return (value: string) => {
    if (value[0] === "$") {
      return "$" + transform(value.substring(1));
    }

    return transform(value);
  };
}

function stripKeysAndChangeCase(
  o: any,
  props: t.Props,
  transformCheckKey: (s: string) => string,
  transformResultKey: (s: string) => string
): unknown {
  const keys = Object.getOwnPropertyNames(o);

  let shouldStrip = false;
  const r: any = {};

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]!;
    const checkKey = transformCheckKey(key);
    const resultKey = transformResultKey(key);

    const isPropKey = Object.prototype.hasOwnProperty.call(props, checkKey);

    if (!isPropKey || key !== resultKey) {
      shouldStrip = true;
    }

    if (isPropKey) {
      r[resultKey] = o[key];
    }
  }

  return shouldStrip ? r : o;
}

function exactWithCase<C extends t.HasProps>(
  codec: C,
  name: string = getExactWithCaseTypeName(codec)
): t.ExactC<C> {
  const props: t.Props = getProps(codec);
  return new t.ExactType(
    name,
    codec.is,
    (u, c) => {
      const unknownResult = t.UnknownRecord.validate(u, c);
      if (isLeft(unknownResult)) {
        return unknownResult;
      }

      const strippedObject = stripKeysAndChangeCase(
        unknownResult.right,
        props,
        prefixAwareCase(camelCase),
        prefixAwareCase(camelCase)
      );

      return codec.validate(strippedObject, c);
    },
    a => {
      const encoded = codec.encode(a);
      return stripKeysAndChangeCase(
        encoded,
        props,
        identity,
        prefixAwareCase(snakeCase)
      );
    },
    codec
  );
}

type ReadonlyObjectType<P extends t.Props> = t.Type<
  {
    readonly [K in keyof P]: t.TypeOf<P[K]>;
  },
  any,
  any
>;

type PartialReadonlyObjectType<P extends t.Props> = t.Type<
  {
    readonly [K in keyof P]?: t.TypeOf<P[K]>;
  },
  any,
  any
>;

export function object<P extends t.Props>(
  props: P,
  name?: string
): ReadonlyObjectType<P> {
  return t.readonly(exactWithCase(t.type(props, name)));
}

export function partialObject<P extends t.Props>(
  props: P,
  name?: string
): PartialReadonlyObjectType<P> {
  return t.readonly(exactWithCase(t.partial(props, name)));
}

export function dualObject<P1 extends t.Props, P2 extends t.Props>(
  props: P1,
  partialProps: P2
) {
  return t.intersection([object(props), partialObject(partialProps)]);
}

//
// Exclusive union.
//

export function exclusiveUnion<CS extends [Mixed, Mixed, ...Array<Mixed>]>(
  codecs: CS
): t.Type<ExclusiveUnion<TypeOf<CS[number]>>> {
  const name = `Exclusive(${codecs.map(type => type.name).join(" | ")})`;
  return new UnionType(
    name,
    (u): u is TypeOf<CS[number]> => codecs.some(type => type.is(u)),
    (u, c) => {
      const errors: Errors = [];
      const successes = [];

      for (let i = 0; i < codecs.length; i++) {
        const codec = codecs[i]!;
        const result = codec.validate(u, appendContext(c, String(i), codec, u));
        if (isLeft(result)) {
          errors.push(...result.left);
        } else {
          successes.push(result.right);
        }
      }

      if (successes.length === 1) {
        return success(successes[0]);
      } else if (successes.length > 1) {
        return failures([
          {context: c, value: u, message: "Multiple matching codecs."},
        ]);
      } else {
        return failures(errors);
      }
    },
    codecs.every(c => c.encode === identity)
      ? identity
      : a => {
          for (const codec of codecs) {
            if (codec.is(a)) {
              return codec.encode(a);
            }
          }
          // https://github.com/gcanti/io-ts/pull/305
          throw new Error(
            `no codec found to encode value in union type ${name}`
          );
        },
    codecs
  );
}

//
// Default value.
//

export function defaultValue<T, O>(type: t.Type<T, O>, defaultValue: T) {
  return new t.Type<T, O | undefined>(
    "DefaultOf" + type.name,
    type.is,
    value => {
      if (!isDefined(value)) {
        return t.success(defaultValue);
      }

      return type.decode(value);
    },
    value => {
      if (value === defaultValue) {
        return undefined;
      }

      return type.encode(value);
    }
  );
}

//
// Array that ignores invalid elements.
//

export function arrayIgnore<C extends t.Mixed>(itemsType: C) {
  type Result = ReadonlyArray<TypeOf<C>>;

  return new t.Type<Result>(
    "ArrayIgnoreOf" + itemsType.name,
    (value: unknown): value is Result => {
      if (!isArray(value)) {
        return false;
      }

      return value.every(value => itemsType.is(value));
    },
    (value, context) => {
      if (!isArray(value)) {
        return t.failure(value, context);
      }

      const array = value
        .map(item => itemsType.decode(item))
        .filter(isRight)
        .map(item => item.right);

      return t.success(array);
    },
    value => {
      return value.map(item => itemsType.encode(item));
    }
  );
}

//
// Partial record combinator for enums.
//

export function enumRecord<C extends t.Mixed, D extends t.Mixed>(
  domain: C,
  codomain: D
): t.DictionaryType<
  C,
  D,
  {
    [K in t.TypeOf<C>]?: t.TypeOf<D>;
  },
  {
    [K in t.OutputOf<C>]: t.OutputOf<C>;
  },
  unknown
> {
  return t.record(domain, codomain) as any;
}

//
// Enum type.
//

type Enum = {[key: string]: string | number};

export function listEnumValues<T extends Enum>(sourceEnum: T) {
  function isStringKey(key: string) {
    const numberKey = Number(key);
    return isNaN(numberKey) || sourceEnum[sourceEnum[key] || ""] !== numberKey;
  }

  function keyToValue(key: keyof T) {
    return sourceEnum[key];
  }

  return Object.keys(sourceEnum).filter(isStringKey).map(keyToValue);
}

export function enumeration<T extends Enum>(
  sourceEnum: T
): t.Type<T[keyof T], string | number, unknown> {
  const enumValues = new Set<string | number>(listEnumValues(sourceEnum));

  function isEnumValue(value: unknown): value is T[keyof T] {
    return (isString(value) || isNumber(value)) && enumValues.has(value);
  }

  return new t.Type(
    "Enum",
    isEnumValue,
    (value: unknown, context) => {
      if (isEnumValue(value)) {
        return t.success(value);
      }

      return t.failure(value, context);
    },
    value => value
  );
}

type StringEnum = {[key: string]: string};

export function weakEnumeration<T extends StringEnum>(
  sourceEnum: T
): t.Type<`${T[keyof T]}`, string, unknown> {
  const enumValues = new Set<string | number>(listEnumValues(sourceEnum));

  function isEnumValue(value: unknown): value is `${T[keyof T]}` {
    return (isString(value) || isNumber(value)) && enumValues.has(value);
  }

  return new t.Type(
    "WeakEnum",
    isEnumValue,
    (value: unknown, context) => {
      if (isEnumValue(value)) {
        return t.success(value);
      }

      return t.failure(value, context);
    },
    value => value
  );
}

interface EnumerationWithValuesOptions {
  isCaseSensitive: boolean;
}

export function enumerationWithValues<T extends Enum>(
  sourceEnum: T,
  values: {[K in T[keyof T]]: string},
  {isCaseSensitive}: EnumerationWithValuesOptions = {isCaseSensitive: true}
): t.Type<T[keyof T], string, unknown> {
  // Case sensitivity.
  const valueTransform = isCaseSensitive ? identity : toLower;

  // Mapper.
  const invertedValues = map(
    values,
    (value, key) => [valueTransform(value), key as any as T[keyof T]] as const
  );
  const valueMap = new Map(invertedValues);

  // Type guard.
  const enumValues = new Set<string | number>(listEnumValues(sourceEnum));
  function isEnumValue(value: unknown): value is T[keyof T] {
    return (isString(value) || isNumber(value)) && enumValues.has(value);
  }

  return new t.Type(
    "EnumWithValues",
    isEnumValue,
    (value: unknown, context) => {
      const enumValue = isString(value) && valueMap.get(valueTransform(value));
      if (!enumValue) {
        return t.failure(value, context);
      }

      return t.success(enumValue);
    },
    value => values[value]
  );
}

//
// Bytes type.
//

class Base64Bytes extends t.Type<Uint8Array, string> {
  constructor() {
    function is(value: unknown): value is Uint8Array {
      return value instanceof Uint8Array;
    }

    function validate(
      value: unknown,
      context: t.Context
    ): t.Validation<Uint8Array> {
      if (is(value)) {
        return t.success(value);
      }

      try {
        const valueBytes = atob(String(value));
        return t.success(Uint8Array.from(valueBytes, c => c.charCodeAt(0)));
      } catch (_error) {
        return t.failure(value, context);
      }
    }

    function encode(value: Uint8Array) {
      const bytes = String.fromCharCode.apply(null, value as any);
      return btoa(bytes);
    }

    super("Base64Bytes", is, validate, encode);
  }
}

export const base64Bytes = new Base64Bytes();

class Utf8Bytes extends t.Type<Uint8Array, string> {
  constructor() {
    const textEncoder = new TextEncoder();
    const textDecoder = new TextDecoder();

    function is(value: unknown): value is Uint8Array {
      return value instanceof Uint8Array;
    }

    function validate(
      value: unknown,
      context: t.Context
    ): t.Validation<Uint8Array> {
      if (is(value)) {
        return t.success(value);
      }

      try {
        return t.success(textEncoder.encode(String(value)));
      } catch (_error) {
        return t.failure(value, context);
      }
    }

    function encode(value: Uint8Array) {
      return textDecoder.decode(value);
    }

    super("Utf8Bytes", is, validate, encode);
  }
}

export const utf8Bytes = new Utf8Bytes();

//
// Helpers.
//

export type RType<T> = t.Type<T, unknown, unknown>;

export function optional<T extends t.Any>(model: T) {
  return t.union([t.undefined, model]);
}

export function clean<T>(model: t.Type<T, any, unknown>) {
  return model;
}

export function validate<M extends t.Any>(
  model: M,
  value: unknown
): t.TypeOf<M> {
  if (!model.is(value)) {
    throw new Error("Error while validating.");
  }

  return value;
}

export function tryDecode<M extends t.Any>(
  model: M,
  value: unknown
): t.TypeOf<M> | undefined {
  const result = model.decode(value);
  if (isLeft(result)) {
    return undefined;
  }

  return result.right;
}

export function decode<M extends t.Any>(model: M, value: unknown): t.TypeOf<M> {
  const result = model.decode(value);
  if (isLeft(result)) {
    console.log(...reporter.report(result));
    throw new Error("Error while decoding.");
  }

  return result.right;
}

export function encode<M extends t.Any>(model: M, value: t.TypeOf<M>) {
  return model.encode(value);
}
