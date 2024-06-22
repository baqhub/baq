import * as IO from "../../helpers/io.js";

//
// Model.
//

export interface EntityLink {
  entity: string;
  originalEntity?: string;
  versionCreatedAt?: Date;
}

//
// Runtime model.
//

export class REntityLinkClass extends IO.Type<EntityLink, unknown, unknown> {
  constructor() {
    const model = IO.intersection([
      IO.object({
        entity: IO.string,
      }),
      IO.partialObject({
        originalEntity: IO.string,
        versionCreatedAt: IO.isoDate,
      }),
    ]);

    super("EntityLink", model.is, model.validate, model.encode);
  }
}

const REntityLink = new REntityLinkClass();

//
// I/O.
//

function buildEntityLink(entity: string): EntityLink {
  return {entity};
}

export const EntityLink = {
  io: () => REntityLink,
  new: buildEntityLink,
};
