import {BirdConstants} from "../state/constants.js";

export function normalizeEntity(entity: string) {
  const baseEntity = entity.includes(".")
    ? entity
    : `${entity}.${BirdConstants.defaultDomain}`;

  return baseEntity.toLowerCase();
}
