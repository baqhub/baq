import memoize from "lodash/memoize.js";
import reduce from "lodash/reduce.js";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import metaToPaths from "../../helpers/fs.js";
import {formatCode} from "../formatter.js";

//
// Model.
//

export interface RecordTypeFileVariables {
  namePascalCase: string;
  nameCamelCase: string;
  typeEntity: string;
  typeRecordId: string;
  typeVersionHash: string;
  contentIo: string;
  contentTs: string;
}

//
// I/O.
//

async function readTemplateFileBase(templateName: string) {
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

export const readTemplateFile = memoize(readTemplateFileBase);

export async function writeRecordTypeFile(
  projectFilesPath: string,
  vars: RecordTypeFileVariables
) {
  const template = await readTemplateFile("recordType.ts.template");

  const fileRaw = reduce(
    vars,
    (result, value, key) => result.replaceAll(`{${key}}`, value),
    template
  );

  const fileFormatted = await formatCode(fileRaw, projectFilesPath);

  const recordTypeFilePath = path.join(
    projectFilesPath,
    `${vars.nameCamelCase}Record.ts`
  );
  await fs.writeFile(recordTypeFilePath, fileFormatted);
}
