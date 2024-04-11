import {dirname} from "node:path";
import {fileURLToPath} from "node:url";

export default function metaToPaths(meta: ImportMeta) {
  const filePath = fileURLToPath(meta.url);
  const directoryPath = dirname(filePath);
  return {directoryPath, filePath};
}
