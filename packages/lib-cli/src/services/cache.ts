import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";

const cachePath = path.join(os.homedir(), ".baq", "cache");

export async function readFromCache(hash: string) {
  const filePath = path.join(cachePath, `${hash}.json`);
  return await fs.readFile(filePath, {encoding: "utf8"});
}

export async function writeToCache(hash: string, content: string) {
  const filePath = path.join(cachePath, `${hash}.json`);
  await fs.mkdir(cachePath, {recursive: true});
  await fs.writeFile(filePath, content);
}
