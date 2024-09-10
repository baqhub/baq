import {unreachable} from "@baqhub/sdk";
import memoize from "lodash/memoize.js";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import metaToPaths from "../../helpers/fs.js";
import {ProjectType} from "../../model/project.js";

async function readTemplateFile(templateName: string) {
  const {directoryPath} = metaToPaths(import.meta);
  const templatePath = path.join(
    directoryPath,
    "..",
    "..",
    "..",
    "..",
    "templates",
    templateName
  );

  return fs.readFile(templatePath, {encoding: "utf-8"});
}

function extensionForType(projectType: ProjectType) {
  switch (projectType) {
    case ProjectType.JS:
    case ProjectType.JS_REACT:
      return "js";

    case ProjectType.TS:
    case ProjectType.TS_REACT:
      return "ts";

    default:
      unreachable(projectType);
  }
}

export const Templates = {
  read: memoize(readTemplateFile),
  extension: extensionForType,
};
