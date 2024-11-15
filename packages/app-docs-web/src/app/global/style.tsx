import tiwi from "tiwi";

export const Text = tiwi.div`
  text-zinc-900
  dark:text-white
  select-none
`;

export const TextSelect = tiwi(Text)`
  select-text
`;
