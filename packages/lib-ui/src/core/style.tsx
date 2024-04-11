import {fixImport} from "@baqhub/sdk";
import tailwind from "tailwind-styled-components";

export const tw = fixImport(tailwind);

export const Column = tw.div`
  flex
  flex-col
  min-w-0
`;

export const FormColumn = tw.form`
  flex
  flex-col
  min-w-0
`;

export const Row = tw.div`
  flex
  flex-row
  min-w-0
`;

export const ButtonRow = tw.button`
  flex
  flex-row
  min-w-0

  select-none
  outline-none
  cursor-default
`;

export const Grid = tw.div`
  grid
  min-w-0
  min-h-0
  grid-cols-[1fr]
  grid-rows-[1fr]
`;

export const FormGrid = tw.form`
  grid
  min-w-0
  grid-cols-[1fr]
  grid-rows-[1fr]
`;

export const Text = tw.div`
  text-sm
  text-neutral-900
  dark:text-white
  select-none
`;

export const Link = tw.a`
  text-sm
  text-neutral-900
  dark:text-white
  select-none
  hover:underline
  underline-offset-2
`;

export const Bold = tw.span`
  font-bold
`;

export const SemiBold = tw.span`
  font-semibold
`;

export type UISize = "small" | "medium" | "large";

export function classForSize(size: UISize | undefined) {
  switch (size) {
    case "medium":
      return "size-md";

    case "large":
      return "size-lg";

    default:
      return "size-sm";
  }
}
