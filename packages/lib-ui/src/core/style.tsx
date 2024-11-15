import tiwi from "tiwi";

export const Column = tiwi.div`
  flex
  min-w-0
  flex-col
`;

export const FormColumn = tiwi.form`
  flex
  min-w-0
  flex-col
`;

export const Row = tiwi.div`
  flex
  min-w-0
  flex-row
`;

export const ButtonRow = tiwi.button`
  flex
  min-w-0
  cursor-default

  select-none
  flex-row
  outline-none
`;

export const Grid = tiwi.div`
  grid
  min-h-0
  min-w-0
  grid-cols-[1fr]
  grid-rows-[1fr]
`;

export const FormGrid = tiwi.form`
  grid
  min-w-0
  grid-cols-[1fr]
  grid-rows-[1fr]
`;

export const Text = tiwi.div`
  cursor-default
  select-none
  text-sm
  text-neutral-900
  dark:text-white
`;

export const TextSelect = tiwi(Text)`
  cursor-text
  select-text
`;

export const Link = tiwi.a`
  select-none
  text-sm
  text-neutral-900
  underline-offset-2
  hover:underline
  dark:text-white
`;

export const Bold = tiwi.span`
  font-bold
`;

export const SemiBold = tiwi.span`
  font-semibold
`;

export type UISize = "small" | "medium" | "large";
