import snakeCase from "lodash/snakeCase.js";
import * as path from "node:path";
import {pascalCase} from "../helpers/case.js";
import {ProgramError, handleErrors} from "../helpers/error.js";
import {Program} from "../index.js";
import {tryFindProfileFile} from "../services/files/profileFile.js";
import {
  removeTypeFromProjectFile,
  tryFindProjectFile,
} from "../services/files/projectFile.js";
import {restoreProject} from "../services/restore.js";

export async function removeCommand(program: Program, name: string) {
  await handleErrors(
    program,
    async () => {
      // Find the project file.
      const projectFile = await tryFindProjectFile(path.resolve("."));
      if (!projectFile) {
        throw new ProgramError("This is not a valid BAQ project.");
      }

      const typeName = snakeCase(name);
      if (!projectFile.project.recordTypes[typeName]) {
        throw new ProgramError(
          "No record type with this name in this project."
        );
      }

      console.log("Removing record type:", pascalCase(typeName));

      // Remove from project file.
      const newProjectFile = await removeTypeFromProjectFile(
        projectFile,
        typeName
      );

      // Restore the types.
      const profileFile = await tryFindProfileFile(path.resolve("."));
      await restoreProject(newProjectFile, profileFile);

      console.log("Record type removed!");
    },
    "Something went wrong while removing."
  );
}
