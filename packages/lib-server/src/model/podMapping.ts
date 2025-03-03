import {IO} from "@baqhub/sdk";
import {Pod} from "./pod.js";

//
// Model.
//

const RPodMapping = IO.object({
  id: IO.string,
  entity: IO.string,
  createdAt: IO.isoDate,
});

export interface PodMapping extends IO.TypeOf<typeof RPodMapping> {}

//
// API.
//

function ofPod(pod: Pod): PodMapping {
  return {
    id: pod.id,
    entity: pod.entity,
    createdAt: new Date(),
  };
}

function withEntity(mapping: PodMapping, entity: string): PodMapping {
  return {...mapping, entity};
}

export const PodMapping = {
  io: RPodMapping,
  ofPod,
  withEntity,
};
