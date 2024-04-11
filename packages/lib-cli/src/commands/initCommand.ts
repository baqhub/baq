import {input, select} from "@inquirer/prompts";
import * as path from "node:path";
import {ProgramError, handleErrors} from "../helpers/error.js";
import {Program} from "../index.js";
import {ProjectType, buildProject} from "../model/project.js";
import {
  doesProjectFileExist,
  writeProjectFile,
} from "../services/files/projectFile.js";

export async function initCommand(program: Program, folderPath: string) {
  await handleErrors(
    program,
    async () => {
      // Confirm the project location.
      const projectFolderPath = path.resolve(folderPath);
      const newProjectFolderPathRaw = await input({
        message: "Where should the project be created?",
        default: projectFolderPath,
      });

      if (!newProjectFolderPathRaw) {
        return;
      }

      // Check if a BAQ project already exists.
      const newProjectFolderPath = path.resolve(newProjectFolderPathRaw);
      if (await doesProjectFileExist(newProjectFolderPath)) {
        throw new ProgramError(
          "A BAQ project already exists at the target location."
        );
      }

      // Prompt for the app name.
      const name = await input({
        message: "What's the user-facing name of this project?",
      });
      if (!name) {
        return;
      }

      // Prompt for the project type.
      const projectType = await select({
        message: "What type of project is this?",
        choices: [
          {value: ProjectType.TS_REACT, name: "TypeScript React"},
          {value: ProjectType.TS, name: "TypeScript"},
          {value: ProjectType.JS_REACT, name: "JavaScript React"},
          {value: ProjectType.JS, name: "JavaScript"},
        ],
      });

      // Prompt for the project files path.
      const projectFilesPathAbsolute = path.resolve(
        await input({
          message: "Where should the project files live?",
          default: "./src/baq",
        })
      );
      const projectFilesPathRelative = path.relative(
        newProjectFolderPath,
        projectFilesPathAbsolute
      );

      // Write the project file.
      const project = buildProject(name, projectType, projectFilesPathRelative);
      await writeProjectFile({path: newProjectFolderPath, project});

      // TODO: Install dependencies (SDK/SDK-React).

      console.log(
        "\r\nProject created!" + '\r\nUse "baq add" to add your first type.'
      );
    },
    "Something went wrong while initializing."
  );
}
