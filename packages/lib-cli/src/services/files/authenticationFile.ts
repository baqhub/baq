import reduce from "lodash/reduce.js";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import {formatCode} from "../formatter.js";
import {readTemplateFile} from "./recordTypeFile.js";

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

export async function writeAuthenticationFile(
  projectFilesPath: string,
  vars: AuthenticationFileVariables
) {
  const template = await readTemplateFile("authentication.ts.template");

  const fileRaw = reduce(
    vars,
    (result, value, key) => result.replaceAll(`{${key}}`, value || ""),
    template
  );

  const fileFormatted = await formatCode(fileRaw, projectFilesPath);

  const recordTypeFilePath = path.join(projectFilesPath, "authentication.ts");
  await fs.writeFile(recordTypeFilePath, fileFormatted);
}
