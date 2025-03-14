import {ExclusiveUnion} from "../type.js";

// Validate exclusive behavior of ExclusiveUnion.
{
  type Type1 = {value1: string};
  type Type2 = {value2: string};
  type ExUnion = ExclusiveUnion<Type1 | Type2>;

  const actual: ExUnion = {} as any;

  if (typeof actual.value1 !== "undefined") {
    const _test1: string = actual.value1;

    // @ts-expect-error Undefined "value2" prop.
    const _test2: string = actual.value2;
  }

  if (typeof actual.value2 !== "undefined") {
    const _test1: string = actual.value2;

    // @ts-expect-error Undefined "value1" prop.
    const _test2: string = actual.value1;
  }
}

// Validate Date behavior of ExclusiveUnion.
{
  type Type1 = {value1: Date};
  type Type2 = {value2: string};
  type ExUnion = ExclusiveUnion<Type1 | Type2>;

  const actual: ExUnion = {} as any;

  if (typeof actual.value1 !== "undefined") {
    const _test1: Date = actual.value1;
  }
}
