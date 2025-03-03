import {PodMapping} from "../../model/podMapping.js";

export interface PodMappingStore {
  get(entity: string): Promise<PodMapping | undefined>;
  set(mapping: PodMapping): Promise<void>;
}
