import reduce from "lodash/reduce.js";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import {ProjectType} from "../../model/project.js";
import {formatCode} from "../formatter.js";
import {Templates} from "./templates.js";

//
// Model.
//

export interface AuthenticationFileVariables {
  appName: string;
  appDescription: string | undefined;
  appWebsiteUrl: string | undefined;
  recordTypesImport: string;
  scopeRequest: string;
}

//
// I/O.
//

const templatePaths: {[K in ProjectType]?: string} = {
  [ProjectType.JS_REACT]: "authentication.js.template",
  [ProjectType.TS_REACT]: "authentication.ts.template",
};

export async function writeAuthenticationFile(
  projectType: ProjectType,
  projectFilesPath: string,
  vars: AuthenticationFileVariables
) {
  const templatePath = templatePaths[projectType];
  if (!templatePath) {
    return;
  }

  const template = await Templates.read(templatePath);

  const fileRaw = reduce(
    vars,
    (result, value, key) => result.replaceAll(`{${key}}`, value || ""),
    template
  );

  const fileFormatted = await formatCode(fileRaw, projectFilesPath);

  const recordTypeFilePath = path.join(
    projectFilesPath,
    `authentication.${Templates.extension(projectType)}`
  );
  await fs.writeFile(recordTypeFilePath, fileFormatted);
}
