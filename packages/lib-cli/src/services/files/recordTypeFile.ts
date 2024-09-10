import reduce from "lodash/reduce.js";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import {ProjectType} from "../../model/project.js";
import {formatCode} from "../formatter.js";
import {Templates} from "./templates.js";

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

const templatePaths: {[K in ProjectType]: string} = {
  [ProjectType.JS]: "recordType.js.template",
  [ProjectType.JS_REACT]: "recordType.js.template",
  [ProjectType.TS]: "recordType.ts.template",
  [ProjectType.TS_REACT]: "recordType.ts.template",
};

export async function writeRecordTypeFile(
  projectType: ProjectType,
  projectFilesPath: string,
  vars: RecordTypeFileVariables
) {
  const templatePath = templatePaths[projectType];
  const template = await Templates.read(templatePath);

  const fileRaw = reduce(
    vars,
    (result, value, key) => result.replaceAll(`{${key}}`, value),
    template
  );

  const fileFormatted = await formatCode(fileRaw, projectFilesPath);

  const recordTypeFilePath = path.join(
    projectFilesPath,
    `${vars.nameCamelCase}Record.${Templates.extension(projectType)}`
  );
  await fs.writeFile(recordTypeFilePath, fileFormatted);
}
