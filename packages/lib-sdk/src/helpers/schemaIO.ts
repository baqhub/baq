import {isLeft} from "fp-ts/lib/Either.js";
import {Canonicalization} from "./canonicalization.js";
import * as IO from "./io.js";
import {Str} from "./string.js";
import {isDefined} from "./type.js";

//
// Array.
//

export interface SchemaArrayOptions {
  minItems?: number;
  maxItems?: number;
  distinctItems?: boolean;
}

function countUniqueItems<T>(array: ReadonlyArray<T>) {
  return new Set(array.map(Canonicalization.canonicalize)).size;
}

function schemaArray<I extends IO.Mixed>(
  itemsSchema: I,
  options: SchemaArrayOptions = {}
) {
  const {minItems, maxItems, distinctItems} = options;
  const baseType = IO.readonlyArray(itemsSchema);

  function validateValue(value: ReadonlyArray<I["_A"]>) {
    if (isDefined(minItems) && value.length < minItems) {
      return false;
    }

    if (isDefined(maxItems) && value.length > maxItems) {
      return false;
    }

    if (distinctItems && countUniqueItems(value) !== value.length) {
      return false;
    }

    return true;
  }

  function isSchemaArray(value: unknown): value is ReadonlyArray<I["_A"]> {
    if (!baseType.is(value)) {
      return false;
    }

    return validateValue(value);
  }

  return new IO.RefinementType(
    "SchemaArray",
    isSchemaArray,
    (value: unknown, context) => {
      const result = baseType.validate(value, context);
      if (isLeft(result)) {
        return IO.failure(value, context);
      }

      if (!validateValue(result.right)) {
        return IO.failure(value, context, "Not a valid SchemaArray.");
      }

      return IO.success(result.right);
    },
    value => baseType.encode(value),
    baseType,
    () => true
  );
}

//
// Map.
//

function schemaMap<V extends IO.Mixed>(valuesSchema: V) {
  return IO.record(IO.string, valuesSchema);
}

//
// Boolean.
//

function schemaBoolean() {
  return IO.boolean;
}

//
// String.
//

export interface SchemaStringOptions {
  minLength?: number;
  maxLength?: number;
}

function schemaString(options: SchemaStringOptions = {}) {
  const {minLength, maxLength} = options;
  const baseType = IO.string;

  function validateValue(value: string) {
    // Normalization.
    if (value.normalize() !== value) {
      return false;
    }

    if (!isDefined(minLength) && !isDefined(maxLength)) {
      return true;
    }

    const length = Str.unicodeLength(value);

    // MinLength.
    if (isDefined(minLength) && length < minLength) {
      return false;
    }

    // MaxLength.
    if (isDefined(maxLength) && length > maxLength) {
      return false;
    }

    return true;
  }

  function isSchemaString(value: unknown): value is string {
    if (!baseType.is(value)) {
      return false;
    }

    return validateValue(value);
  }

  return new IO.Type(
    "SchemaString",
    isSchemaString,
    (value: unknown, context) => {
      const result = baseType.validate(value, context);
      if (isLeft(result)) {
        return IO.failure(value, context);
      }

      if (!validateValue(result.right)) {
        return IO.failure(value, context, "Not a valid SchemaString.");
      }

      return IO.success(result.right);
    },
    value => baseType.encode(value)
  );
}

//
// Int.
//

export interface SchemaIntOptions {
  min?: number;
  max?: number;
}

function schemaInt(options: SchemaIntOptions = {}) {
  const {min, max} = options;
  const baseType = IO.Int;

  function validateValue(value: number) {
    if (isDefined(min) && value < min) {
      return false;
    }

    if (isDefined(max) && value > max) {
      return false;
    }

    return true;
  }

  function isSchemaInt(value: unknown): value is number {
    if (!baseType.is(value)) {
      return false;
    }

    return validateValue(value);
  }

  return new IO.Type(
    "SchemaInt",
    isSchemaInt,
    (value: unknown, context) => {
      const result = baseType.validate(value, context);
      if (isLeft(result)) {
        return IO.failure(value, context);
      }

      if (!validateValue(result.right)) {
        return IO.failure(value, context, "Not a valid SchemaInt.");
      }

      return IO.success(result.right);
    },
    value => value
  );
}

//
// Number.
//

export interface SchemaNumberOptions {
  min?: number;
  max?: number;
}

function schemaNumber(options: SchemaNumberOptions = {}) {
  const {min, max} = options;
  const baseType = IO.number;

  function validateValue(value: number) {
    if (isDefined(min) && value < min) {
      return false;
    }

    if (isDefined(max) && value > max) {
      return false;
    }

    return true;
  }

  function isSchemaNumber(value: unknown): value is number {
    if (!baseType.is(value)) {
      return false;
    }

    return validateValue(value);
  }

  return new IO.Type(
    "SchemaNumber",
    isSchemaNumber,
    (value: unknown, context) => {
      const result = baseType.validate(value, context);
      if (isLeft(result)) {
        return IO.failure(value, context);
      }

      if (!validateValue(result.right)) {
        return IO.failure(value, context, "Not a valid SchemaNumber.");
      }

      return IO.success(result.right);
    },
    value => value
  );
}

//
// Exports.
//

export const SchemaIO = {
  object: IO.dualObject,
  array: schemaArray,
  map: schemaMap,
  boolean: schemaBoolean,
  string: schemaString,
  int: schemaInt,
  number: schemaNumber,
};
