import {KvKey} from "@baqhub/server";

function podIdForEntity(entity: string): KvKey<string> {
  return ["baq", "pod_id", entity];
}

// function pod(podId: string): KvKey<BaqPod> {
//   return ["baq", "pod", podId];
// }

// function record(podId: string, authorId: string, recordId: string) {
//   return ["baq", "record", podId, authorId, recordId];
// }

// function recordVersion(
//   podId: string,
//   authorId: string,
//   recordId: string,
//   versionHash: string
// ) {
//   return ["baq", "record_version", podId, authorId, recordId, versionHash];
// }

export const BaqKvKeys = {
  podIdForEntity,
};
