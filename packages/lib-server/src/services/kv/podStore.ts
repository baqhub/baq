import {Pod} from "../../model/pod.js";

export interface PodStore {
  get(): Promise<Pod | undefined>;
  set(pod: Pod): Promise<void>;
}
