import {IO} from "@baqhub/sdk";

export const Pod = IO.object({
  id: IO.string,
  entity: IO.string,
  context: IO.unknown,
  createdAt: IO.isoDate,
  updatedAt: IO.isoDate,
});

export interface Pod extends IO.TypeOf<typeof Pod> {}
