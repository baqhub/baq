import tiwi from "tiwi";

export const Column = tiwi.div`
  flex
  flex-col
  min-w-0
`;

export const FormColumn = tiwi.form`
  flex
  flex-col
  min-w-0
`;

export const Row = tiwi.div`
  flex
  flex-row
  min-w-0
`;

export const ButtonRow = tiwi.button`
  flex
  flex-row
  min-w-0

  select-none
  outline-hidden
  cursor-default
`;

export const Grid = tiwi.div`
  grid
  min-w-0
  min-h-0
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
  text-sm
  text-neutral-900
  dark:text-white
  cursor-default
  select-none
`;

export const TextSelect = tiwi(Text)`
  cursor-text
  select-text
`;

export const Link = tiwi.a`
  select-none
  text-sm
  text-neutral-900
  dark:text-white

  hover:underline
  underline-offset-2
`;

export const Bold = tiwi.span`
  font-bold
`;

export const SemiBold = tiwi.span`
  font-semibold
`;

export type UISize = "small" | "medium" | "large";
