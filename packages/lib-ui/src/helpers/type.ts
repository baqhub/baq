import {ComponentType} from "react";

export function makeVariants<T extends string>() {
  return <C extends ComponentType<any>, V extends {[K in T]: C}>(
    variants: V
  ) => {
    return variants;
  };
}
