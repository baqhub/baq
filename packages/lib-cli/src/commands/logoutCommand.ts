import {confirm} from "@inquirer/prompts";
import * as path from "node:path";
import {ProgramError, handleErrors} from "../helpers/error.js";
import {Program} from "../index.js";
import {
  deleteProfileFile,
  tryFindProfileFile,
} from "../services/files/profileFile.js";

export async function logoutCommand(program: Program) {
  await handleErrors(
    program,
    async () => {
      // Check if we're already authenticated.
      const profileFile = await tryFindProfileFile(path.resolve("."));
      if (!profileFile?.profile.authentication) {
        throw new ProgramError("Not authenticated.");
      }

      // Confirm intent.
      const {entity} = profileFile.profile.authentication.entityRecord.author;
      const answer = await confirm({
        message: `Logout from account: ${entity}?`,
      });
      if (!answer) {
        return;
      }

      // Delete the profile file.
      await deleteProfileFile(profileFile);

      console.log("Local credentials cleared!");
    },
    "Something went wrong while logging-out."
  );
}
