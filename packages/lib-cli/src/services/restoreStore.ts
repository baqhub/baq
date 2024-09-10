import camelCase from "lodash/camelCase.js";
import {pascalCase} from "../helpers/case.js";
import {
  ProjectFile,
  projectFileToProjectFilesPath,
} from "./files/projectFile.js";
import {writeStoreFile} from "./files/storeFile.js";

export async function maybeRestoreStore(projectFile: ProjectFile) {
  const {type, recordTypes} = projectFile.project;

  // Build imports for each record type.
  const recordTypeNames = Object.keys(recordTypes);

  const recordTypesImport = recordTypeNames
    .map(
      n => `import {${pascalCase(n)}Record} from "./${camelCase(n)}Record.js";`
    )
    .join("\n");

  const recordTypesArg = recordTypeNames
    .map(n => `${pascalCase(n)}Record`)
    .join(", ");

  // Write the file.
  const projectFilesPath = projectFileToProjectFilesPath(projectFile);
  await writeStoreFile(type, projectFilesPath, {
    recordTypesImport,
    recordTypesArg,
  });
}
