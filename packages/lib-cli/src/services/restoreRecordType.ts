import {Schema} from "@baqhub/sdk";
import camelCase from "lodash/camelCase.js";
import {pascalCase} from "../helpers/case.js";
import {ProjectRecordType} from "../model/project.js";
import {
  ProjectFile,
  projectFileToProjectFilesPath,
} from "../services/files/projectFile.js";
import {writeRecordTypeFile} from "../services/files/recordTypeFile.js";
import {entityPlaceholder, versionPlaceholder} from "./constants.js";
import {ProfileFile} from "./files/profileFile.js";
import {
  RecordTypeContentVariables,
  readRecordTypeContent,
} from "./readRecordType.js";
import {schemaToIo} from "./schemaToIo.js";
import {schemaToTs} from "./schemaToTs.js";

export async function restoreRecordType(
  projectFile: ProjectFile,
  profileFile: ProfileFile | undefined,
  name: string,
  recordType: ProjectRecordType
) {
  const typeEntity =
    ("entity" in recordType && recordType.entity) ||
    profileFile?.profile.authentication?.entityRecord.author.entity ||
    entityPlaceholder;

  const vars: RecordTypeContentVariables = {
    entity: typeEntity,
    recordId: recordType.recordId,
  };

  // Fetch the type record.
  const content = await readRecordTypeContent(
    projectFile.path,
    recordType,
    vars
  );
  if (!content) {
    throw new Error("Record type not found.");
  }

  const {schema} = content;
  if (schema.type !== "object") {
    throw new Error("Schema is not valid.");
  }

  // Use schema to build io-ts validation.
  const contentSchema: Schema = schema.properties["content"] || {
    type: "object",
    properties: {},
  };

  const contentTsName = `${pascalCase(name)}RecordContent`;
  const contentTs = schemaToTs(contentSchema, contentTsName);
  const contentIo = schemaToIo(contentSchema);

  // Build and write record type file.
  const projectFilesPath = projectFileToProjectFilesPath(projectFile);
  await writeRecordTypeFile(projectFile.project.type, projectFilesPath, {
    namePascalCase: pascalCase(name),
    nameCamelCase: camelCase(name),
    typeEntity,
    typeRecordId: recordType.recordId,
    typeVersionHash: recordType.versionHash || versionPlaceholder,
    contentTs,
    contentIo,
  });
}
