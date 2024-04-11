import {useConstant} from "@baqhub/sdk-react";

let globalLayerId = 0;

export function useLayerId() {
  return useConstant(() => globalLayerId++);
}
