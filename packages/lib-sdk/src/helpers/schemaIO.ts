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

function schemaArray<I extends IO.Mixed>(
  itemsSchema: I,
  options: SchemaArrayOptions = {}
) {
  const {minItems, maxItems, distinctItems} = options;
  const baseType = IO.readonlyArray(itemsSchema);

  function isSchemaArray(value: unknown): value is ReadonlyArray<I["_A"]> {
    if (!baseType.is(value)) {
      return false;
    }

    if (isDefined(minItems) && value.length < minItems) {
      return false;
    }

    if (isDefined(maxItems) && value.length > maxItems) {
      return false;
    }

    if (distinctItems && new Set(value).size !== value.length) {
      return false;
    }

    return true;
  }

  return new IO.Type(
    "SchemaArray",
    isSchemaArray,
    (value: unknown, context) => {
      if (!isSchemaArray(value)) {
        return IO.failure(value, context);
      }

      return IO.success(value);
    },
    value => baseType.encode(value)
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

  function isSchemaString(value: unknown): value is string {
    if (!baseType.is(value)) {
      return false;
    }

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

  return new IO.Type(
    "SchemaString",
    isSchemaString,
    (value: unknown, context) => {
      if (!isSchemaString(value)) {
        return IO.failure(value, context);
      }

      return IO.success(value);
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

  function isSchemaInt(value: unknown): value is number {
    if (!baseType.is(value)) {
      return false;
    }

    if (isDefined(min) && value < min) {
      return false;
    }

    if (isDefined(max) && value > max) {
      return false;
    }

    return true;
  }

  return new IO.Type(
    "SchemaInt",
    isSchemaInt,
    (value: unknown, context) => {
      if (!isSchemaInt(value)) {
        return IO.failure(value, context);
      }

      return IO.success(value);
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

  function isSchemaNumber(value: unknown): value is number {
    if (!baseType.is(value)) {
      return false;
    }

    if (isDefined(min) && value < min) {
      return false;
    }

    if (isDefined(max) && value > max) {
      return false;
    }

    return true;
  }

  return new IO.Type(
    "SchemaNumber",
    isSchemaNumber,
    (value: unknown, context) => {
      if (!isSchemaNumber(value)) {
        return IO.failure(value, context);
      }

      return IO.success(value);
    },
    value => value
  );
}

export const SchemaIO = {
  object: IO.dualObject,
  array: schemaArray,
  map: schemaMap,
  boolean: schemaBoolean,
  string: schemaString,
  int: schemaInt,
  number: schemaNumber,
};
