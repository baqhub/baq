import * as path from "node:path";
import {ProgramError, handleErrors} from "../helpers/error.js";
import {Program} from "../index.js";
import {tryFindProfileFile} from "../services/files/profileFile.js";
import {tryFindProjectFile} from "../services/files/projectFile.js";
import {restoreProject} from "../services/restore.js";

export async function restoreCommand(program: Program) {
  await handleErrors(
    program,
    async () => {
      const projectFile = await tryFindProjectFile(path.resolve("."));
      if (!projectFile) {
        throw new ProgramError("This is not a valid BAQ project.");
      }

      console.log("Restoring...");
      const profileFile = await tryFindProfileFile(path.resolve("."));
      await restoreProject(projectFile, profileFile);
      console.log("Project restored!");
    },
    "Something went wrong while restoring."
  );
}
