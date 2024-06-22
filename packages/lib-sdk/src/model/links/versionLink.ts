import * as IO from "../../helpers/io.js";

//
// Model.
//

const RVersionLinkRaw = IO.dualObject(
  {
    entity: IO.string,
    recordId: IO.string,
    versionHash: IO.string,
  },
  {
    originalEntity: IO.string,
  }
);

export interface VersionLink extends IO.TypeOf<typeof RVersionLinkRaw> {}
export const RVersionLink = IO.clean<VersionLink>(RVersionLinkRaw);

//
// I/O.
//

function buildVersionLink(
  entity: string,
  recordId: string,
  versionHash: string
): VersionLink {
  return {entity, recordId, versionHash};
}

export const VersionLink = {
  new: buildVersionLink,
};
