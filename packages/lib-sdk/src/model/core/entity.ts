import * as io from "../../helpers/io.js";

//
// Type.
//

export interface EntityBrand {
  readonly Entity: unique symbol;
}

const entityRegexp = /^[a-z0-9.-]{2,252}$/;

export const Entity = io.brand(
  io.string,
  (e): e is io.Branded<string, EntityBrand> => e.match(entityRegexp) !== null,
  "Entity"
);

export type Entity = io.TypeOf<typeof Entity>;
