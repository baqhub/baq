import {BaqPodObject} from "./baqPodObject.js";

function ofNamespace(namespace: DurableObjectNamespace<BaqPodObject>) {
  return {
    async initialize(id: string, entity: string) {
      const objectId = namespace.idFromName(id);
      const object = namespace.get(objectId);

      await object.initialize(id, entity);
    },
  };
}

export const DurablePodStore = {
  ofNamespace,
};
