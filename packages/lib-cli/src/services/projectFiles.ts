import * as fs from "node:fs/promises";
import {
  ProjectFile,
  projectFileToProjectFilesPath,
} from "./files/projectFile.js";

export async function resetProjectFiles(projectFile: ProjectFile) {
  const projectFilesPath = projectFileToProjectFilesPath(projectFile);

  // Reset the directory.
  await fs.rm(projectFilesPath, {recursive: true, force: true});
  await fs.mkdir(projectFilesPath, {recursive: true});
}
