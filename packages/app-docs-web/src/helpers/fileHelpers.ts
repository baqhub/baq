import isObject from "lodash/isObject.js";
import {ImageProps} from "next/image.js";
import {Dirent} from "node:fs";
import * as fs from "node:fs/promises";

export async function listAndMap<T>(
  path: string,
  mapper: (i: Dirent) => Promise<T | undefined>
) {
  try {
    const items = await fs.readdir(path, {withFileTypes: true});
    const tasks = items.map(mapper);
    const results = await Promise.all(tasks);
    return results.filter(isDefined);
  } catch (err) {
    if (isObject(err) && "code" in err && err.code === "ENOENT") {
      return [];
    }

    throw err;
  }
}

function isDefined<T>(value: T | undefined): value is T {
  return typeof value !== "undefined";
}

export async function getImageAsync(imageName: string): Promise<ImageProps> {
  const imported = await import(`../docs/assets/${imageName}.jpg`);
  const image: ImageProps = imported.default;

  return {
    src: image.src,
    alt: "",
    width: image.width,
    height: image.height,
  };
}
