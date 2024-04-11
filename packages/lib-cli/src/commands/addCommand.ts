import {RecordKey, Uuid} from "@baqhub/sdk";
import snakeCase from "lodash/snakeCase.js";
import * as path from "node:path";
import {pascalCase} from "../helpers/case.js";
import {ProgramError, handleErrors} from "../helpers/error.js";
import {Program} from "../index.js";
import {ProjectRecordType} from "../model/project.js";
import {entityPlaceholder, recordIdPlaceholder} from "../services/constants.js";
import {tryFindProfileFile} from "../services/files/profileFile.js";
import {
  addTypeToProjectFile,
  tryFindProjectFile,
} from "../services/files/projectFile.js";
import {
  RecordTypeContentVariables,
  tryFetchRecordType,
  tryReadLocalRecordTypeContent,
} from "../services/readRecordType.js";
import {restoreProject} from "../services/restore.js";

export async function addCommand(
  program: Program,
  typeKey: string,
  name: string | undefined
) {
  await handleErrors(
    program,
    async () => {
      // Find the project file.
      const projectFile = await tryFindProjectFile(path.resolve("."));
      if (!projectFile) {
        throw new ProgramError("This is not a valid BAQ project.");
      }

      // Resolve the provided type.
      const [projectRecordTypeName, projectRecordType] =
        (await tryResolveLocal(projectFile.path, typeKey)) ||
        (await tryResolveRemote(typeKey));

      // Add it to the project file.
      const typeNameBase = name || projectRecordTypeName;
      if (!typeNameBase) {
        throw new ProgramError(
          "A name could not be found for this record type."
        );
      }

      const typeName = snakeCase(typeNameBase);
      if (projectFile.project.recordTypes[typeName]) {
        throw new ProgramError(
          "A record type with this name is already in this project."
        );
      }

      console.log("Adding record type:", pascalCase(typeNameBase));

      const newProjectFile = await addTypeToProjectFile(
        projectFile,
        typeName,
        projectRecordType
      );

      // Restore the types.
      const profileFile = await tryFindProfileFile(path.resolve("."));
      await restoreProject(newProjectFile, profileFile);

      console.log("Record type added!");
    },
    "Something went wrong while adding."
  );
}

async function tryResolveLocal(
  projectPath: string,
  filePath: string
): Promise<[string, ProjectRecordType] | undefined> {
  const vars: RecordTypeContentVariables = {
    entity: entityPlaceholder,
    recordId: recordIdPlaceholder,
  };

  const content = await tryReadLocalRecordTypeContent(
    projectPath,
    filePath,
    vars
  );
  if (!content) {
    return undefined;
  }

  return [
    content.name,
    {
      path: path.relative(projectPath, path.join(projectPath, filePath)),
      recordId: Uuid.new(),
      versionHash: undefined,
      contentHash: undefined,
    },
  ];
}

async function tryResolveRemote(
  typeKey: string
): Promise<[string, ProjectRecordType]> {
  const key = RecordKey.tryParse(typeKey);
  if (!key) {
    throw new Error("This is not a valid record type identifier.");
  }

  const record = await tryFetchRecordType(key.entity, key.recordId);
  if (!record) {
    throw new Error("This record type could not be fetched.");
  }

  return [
    record.content.name,
    {
      entity: record.author.entity,
      recordId: record.id,
      versionHash: record.version?.hash || "",
    },
  ];
}
