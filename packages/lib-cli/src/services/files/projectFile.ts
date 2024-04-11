import {IO} from "@baqhub/sdk";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import {
  Project,
  ProjectRecordType,
  RProject,
  addTypeToProject,
  removeTypeFromProject,
} from "../../model/project.js";

//
// Model.
//

export interface ProjectFile {
  path: string;
  project: Project;
}

//
// I/O.
//

function buildProjectFilePath(projectPath: string) {
  return path.join(projectPath, "baq.json");
}

export function projectFileToProjectFilesPath(projectFile: ProjectFile) {
  return path.join(projectFile.path, projectFile.project.path);
}

export async function doesProjectFileExist(projectPath: string) {
  try {
    const projectFilePath = buildProjectFilePath(projectPath);
    await fs.access(projectFilePath, fs.constants.F_OK);
    return true;
  } catch (err) {
    return false;
  }
}

async function readProjectFile(
  projectPath: string
): Promise<ProjectFile | undefined> {
  try {
    const projectFilePath = buildProjectFilePath(projectPath);
    const projectJson = await fs.readFile(projectFilePath, {encoding: "utf-8"});

    const projectEncoded = JSON.parse(projectJson);
    const project = IO.decode(RProject, projectEncoded);

    return {
      path: path.resolve(projectPath),
      project,
    };
  } catch (err) {
    return undefined;
  }
}

export async function tryFindProjectFile(
  startPath: string
): Promise<ProjectFile | undefined> {
  const projectFile = await readProjectFile(startPath);
  if (projectFile) {
    return projectFile;
  }

  const parentPath = startPath.split(path.sep).slice(0, -1).join(path.sep);
  if (!parentPath) {
    return undefined;
  }

  return tryFindProjectFile(parentPath);
}

export async function writeProjectFile({path, project}: ProjectFile) {
  const projectEncoded = IO.encode(RProject, project);
  const projectJson = JSON.stringify(projectEncoded, undefined, 2);

  const projectFilePath = buildProjectFilePath(path);
  await fs.writeFile(projectFilePath, projectJson);
}

export async function addTypeToProjectFile(
  {path, project}: ProjectFile,
  name: string,
  projectRecordType: ProjectRecordType
) {
  const newProjectFile: ProjectFile = {
    path,
    project: addTypeToProject(project, name, projectRecordType),
  };

  await writeProjectFile(newProjectFile);
  return newProjectFile;
}

export async function removeTypeFromProjectFile(
  {path, project}: ProjectFile,
  name: string
) {
  const newProjectFile: ProjectFile = {
    path,
    project: removeTypeFromProject(project, name),
  };

  await writeProjectFile(newProjectFile);
  return newProjectFile;
}
