import reduce from "lodash/reduce.js";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import {ProjectType} from "../../model/project.js";
import {formatCode} from "../formatter.js";
import {Templates} from "./templates.js";

//
// Model.
//

export interface StoreFileVariables {
  recordTypesImport: string;
  recordTypesArg: string;
}

//
// I/O.
//

const templatePaths: {[K in ProjectType]?: string} = {
  [ProjectType.JS_REACT]: "store.js.template",
  [ProjectType.TS_REACT]: "store.ts.template",
};

export async function writeStoreFile(
  projectType: ProjectType,
  projectFilesPath: string,
  vars: StoreFileVariables
) {
  const templatePath = templatePaths[projectType];
  if (!templatePath) {
    return;
  }

  const template = await Templates.read(templatePath);

  const fileRaw = reduce(
    vars,
    (result, value, key) => result.replaceAll(`{${key}}`, value),
    template
  );

  const fileFormatted = await formatCode(fileRaw, projectFilesPath);

  const recordTypeFilePath = path.join(
    projectFilesPath,
    `store.${Templates.extension(projectType)}`
  );
  await fs.writeFile(recordTypeFilePath, fileFormatted);
}
