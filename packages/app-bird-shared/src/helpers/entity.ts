import {BirdConstants} from "../state/constants.js";

export function normalizeEntity(entity: string) {
  return entity.includes(".")
    ? entity
    : `${entity}.${BirdConstants.defaultDomain}`;
}
