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

export const REntityLinkName = "EntityLink";

export class REntityLinkClass extends IO.Type<EntityLink, unknown, unknown> {
  constructor() {
    const model = IO.dualObject(
      {
        entity: IO.string,
      },
      {
        originalEntity: IO.string,
        versionCreatedAt: IO.isoDate,
      }
    );

    super(REntityLinkName, model.is, model.validate, model.encode);
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
