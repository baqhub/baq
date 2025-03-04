import {BaqPodMappingObject} from "./baqPodMappingObject.js";

function ofNamespace(namespace: DurableObjectNamespace<BaqPodMappingObject>) {
  return {
    async getPodId(entity: string) {
      const objectId = namespace.idFromName(entity);
      const object = namespace.get(objectId);

      return object.getPodId;
    },
    async initialize(entity: string, podId: string) {
      const objectId = namespace.idFromName(entity);
      const object = namespace.get(objectId);

      await object.initialize(entity, podId);
    },
  };
}

export interface DurablePodMappingStore
  extends ReturnType<typeof ofNamespace> {}

export const DurablePodMappingStore = {
  ofNamespace,
};
