import {
  AnyRecord,
  Client,
  Hash,
  IO,
  Record,
  RecordPermissions,
  TypeRecord,
  TypeRecordContent,
} from "@baqhub/sdk";
import * as path from "node:path";
import {pascalCase} from "../helpers/case.js";
import {ProgramError, handleErrors} from "../helpers/error.js";
import {Program} from "../index.js";
import {LocalProjectRecordType, ProjectRecordType} from "../model/project.js";
import {tryFindProfileFile} from "../services/files/profileFile.js";
import {
  ProjectFile,
  addTypeToProjectFile,
  tryFindProjectFile,
} from "../services/files/projectFile.js";
import {
  RecordTypeContentVariables,
  readRecordTypeContent,
} from "../services/readRecordType.js";
import {restoreProject} from "../services/restore.js";

export async function publishCommand(program: Program) {
  await handleErrors(
    program,
    async () => {
      // Find the project file.
      const projectFile = await tryFindProjectFile(path.resolve("."));
      if (!projectFile) {
        throw new ProgramError("This is not a valid BAQ project.");
      }

      // Check the authentication status.
      const profileFile = await tryFindProfileFile(path.resolve("."));
      if (!profileFile?.profile.authentication) {
        throw new ProgramError("Not authenticated.");
      }

      const {entity} = profileFile.profile.authentication.entityRecord.author;
      const client = Client.authenticated(profileFile.profile.authentication);

      console.log("Starting publish...");

      // Publish sequentially.
      const recordTypes = Object.entries(projectFile.project.recordTypes);
      const results: Array<PublishResult> = [];

      let activeProjectFile = projectFile;
      for (const recordType of recordTypes) {
        const [name, type] = recordType;
        const [result, newProjectFile] = await publishRecordType(
          activeProjectFile,
          entity,
          client,
          name,
          type
        );

        activeProjectFile = newProjectFile;
        results.push(result);
      }

      if (results.every(r => r === PublishResult.NOT_LOCAL)) {
        console.log("No record types to publish.");
        return;
      }

      if (results.some(r => r === PublishResult.SUCCESS)) {
        await restoreProject(activeProjectFile, profileFile);
      }

      console.log("Publish complete!");
    },
    "Something went wrong while publishing."
  );
}

enum PublishResult {
  NOT_LOCAL = "NOT_LOCAL",
  UNCHANGED = "UNCHANGED",
  SUCCESS = "SUCCESS",
}

async function publishRecordType(
  projectFile: ProjectFile,
  entity: string,
  client: Client,
  name: string,
  type: ProjectRecordType
): Promise<[PublishResult, ProjectFile]> {
  if (!("path" in type)) {
    return [PublishResult.NOT_LOCAL, projectFile];
  }

  const vars: RecordTypeContentVariables = {
    entity,
    recordId: type.recordId,
  };

  // Read the file.
  const content = await readRecordTypeContent(projectFile.path, type, vars);
  if (!content) {
    throw new Error("Record type not found.");
  }

  // Check if the file has changed since the last upload.
  const contentJson = JSON.stringify(IO.encode(TypeRecordContent, content));
  const contentHash = Hash.shortHash(contentJson); // TODO: Canonicalize.
  if (contentHash === type.contentHash) {
    return [PublishResult.UNCHANGED, projectFile];
  }

  // Fetch the existing record, if any.
  const record = await tryFetchRecord(client, type.recordId);

  // Build the new record and publish.
  const permissions = RecordPermissions.public;
  const newRecord = record
    ? TypeRecord.update(entity, record, content)
    : TypeRecord.new(entity, content, {id: type.recordId, permissions});

  const isUpdate = Boolean(newRecord.version?.parentHash);
  const requestFunc = isUpdate ? client.putRecord : client.postRecord;
  const {record: serverRecord} = await requestFunc(
    AnyRecord,
    TypeRecord,
    newRecord
  );

  // Save the project file with the new hash.
  const newType: LocalProjectRecordType = {
    ...type,
    contentHash,
    versionHash: serverRecord.version?.hash,
  };
  const newProjectFile = await addTypeToProjectFile(projectFile, name, newType);

  console.log("Published type:", pascalCase(name), Record.toKey(newRecord));
  return [PublishResult.SUCCESS, newProjectFile];
}

async function tryFetchRecord(client: Client, recordId: string) {
  try {
    const {record} = await client.getOwnRecord(AnyRecord, TypeRecord, recordId);
    return record;
  } catch (err) {
    return undefined;
  }
}
