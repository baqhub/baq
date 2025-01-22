import {IO} from "@baqhub/sdk";
import {PodMapping} from "../../model/podMapping.js";
import {KvKey, KvStoreAdapter} from "./kvStoreAdapter.js";

function podMappingForEntityKey(entity: string): KvKey<object> {
  return ["pod_mapping", entity];
}

function build(kv: KvStoreAdapter) {
  return {
    async getPodMapping(entity: string) {
      const rawMapping = await kv.get(podMappingForEntityKey(entity));
      if (!rawMapping) {
        return undefined;
      }

      return IO.decode(PodMapping.io, rawMapping);
    },

    async setPodMapping(mapping: PodMapping) {
      const rawMapping = IO.encode(PodMapping.io, mapping);
      await kv.set(podMappingForEntityKey(mapping.entity), rawMapping);
    },
  };
}

export const KvPodMappings = {
  new: build,
};
