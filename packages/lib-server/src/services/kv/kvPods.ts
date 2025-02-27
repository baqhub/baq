import {IO} from "@baqhub/sdk";
import {Pod} from "../../model/pod.js";
import {KvKey, KvStoreAdapter} from "./kvStoreAdapter.js";

function podForPodIdKey(podId: string): KvKey<object> {
  return ["pod", podId];
}

function build(kv: KvStoreAdapter) {
  return {
    async get(podId: string) {
      const rawPod = await kv.get(podForPodIdKey(podId));
      if (!rawPod) {
        return undefined;
      }

      return IO.decode(Pod, rawPod);
    },

    async set(pod: Pod) {
      const rawPod = IO.encode(Pod, pod);
      await kv.set(podForPodIdKey(pod.id), rawPod);
    },
  };
}

export const KvPods = {
  new: build,
};
