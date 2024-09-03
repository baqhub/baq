import {dirname} from "node:path";
import {fileURLToPath} from "node:url";

export function metaToPaths(meta) {
  const filePath = fileURLToPath(meta.url);
  const directoryPath = dirname(filePath);
  return {directoryPath, filePath};
}
