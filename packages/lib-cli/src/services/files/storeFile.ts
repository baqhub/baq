import reduce from "lodash/reduce.js";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import {formatCode} from "../formatter.js";
import {readTemplateFile} from "./recordTypeFile.js";

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

export async function writeStoreFile(
  projectFilesPath: string,
  vars: StoreFileVariables
) {
  const template = await readTemplateFile("store.ts.template");

  const fileRaw = reduce(
    vars,
    (result, value, key) => result.replaceAll(`{${key}}`, value),
    template
  );

  const fileFormatted = await formatCode(fileRaw, projectFilesPath);

  const recordTypeFilePath = path.join(projectFilesPath, "store.ts");
  await fs.writeFile(recordTypeFilePath, fileFormatted);
}
