import {BaqPodMappingObject} from "./baqPodMappingObject.js";

function ofNamespace(namespace: DurableObjectNamespace<BaqPodMappingObject>) {
  return {
    async getPodId(entity: string) {
      const objectId = namespace.idFromName(entity);
      const object = namespace.get(objectId);

      return object.getPodId;
    },
    async setPodId(entity: string, podId: string) {
      const objectId = namespace.idFromName(entity);
      const object = namespace.get(objectId);

      await object.setPodId(entity, podId);
    },
  };
}

export const DurablePodMappingStore = {
  ofNamespace,
};
