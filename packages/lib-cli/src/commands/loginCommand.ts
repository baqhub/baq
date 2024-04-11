import {
  AnyRecord,
  Authentication,
  AuthenticationState,
  Client,
  TypeRecord,
} from "@baqhub/sdk";
import {password} from "@inquirer/prompts";
import * as os from "node:os";
import * as path from "node:path";
import open from "open";
import {ProgramError, handleErrors} from "../helpers/error.js";
import {Program} from "../index.js";
import {
  ProfileFile,
  tryFindProfileFile,
  writeProfileFile,
} from "../services/files/profileFile.js";
import {tryFindProjectFile} from "../services/files/projectFile.js";
import {restoreProject} from "../services/restore.js";

const websiteUrl = "https://cli.baq.dev";
const redirectUrl = websiteUrl + "/auth{/authorization_id}";

export async function loginCommand(program: Program, entity: string) {
  await handleErrors(
    program,
    async () => {
      // Check if we're already authenticated.
      const profileFile = await tryFindProfileFile(path.resolve("."));
      if (profileFile?.profile.authentication) {
        throw new ProgramError(
          "Already authenticated: " +
            profileFile.profile.authentication.entityRecord.author.entity
        );
      }

      console.log("Authenticating:", entity);

      // Discovery + app record.
      const {flowUrl, state} = await Authentication.register(entity, {
        name: "BAQ CLI",
        description:
          "Manage the BAQ schemas in your project, directly from the terminal.",
        uris: {
          website: websiteUrl,
          redirect: redirectUrl,
        },
        scopeRequest: {
          read: [TypeRecord.link],
          write: [TypeRecord.link],
        },
      });

      // Start the browser flow.
      const url = new URL(flowUrl);
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        throw new ProgramError("The authentication flow URL is not valid.");
      }

      console.log("Starting the authentication flow at:", url.toString());
      open(url.toString());

      // Ask for the resulting token.
      const authorizationId = await password({
        message: "Authentication token:",
      });

      // Test authentication and save state.
      const fullState: AuthenticationState = {...state, authorizationId};
      const client = Client.authenticated(fullState);
      await client.getOwnRecord(AnyRecord, AnyRecord, fullState.appRecord.id);

      // Save state.
      const newProfileFile: ProfileFile = {
        path: os.homedir(),
        profile: {
          authentication: fullState,
        },
      };

      await writeProfileFile(newProfileFile);

      // If we're in a project, restore it.
      const projectFile = await tryFindProjectFile(path.resolve("."));
      if (projectFile) {
        await restoreProject(projectFile, newProfileFile);
      }

      console.log("Authenticated!");
    },
    "Something went wrong while logging-in."
  );
}
