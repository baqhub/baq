import {
  AnyRecord,
  Client,
  IO,
  TypeRecord,
  TypeRecordContent,
} from "@baqhub/sdk";
import isMatch from "lodash/isMatch.js";
import memoize from "lodash/memoize.js";
import reduce from "lodash/reduce.js";
import snakeCase from "lodash/snakeCase.js";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import {ProjectRecordType} from "../model/project.js";
import {readFromCache, writeToCache} from "./cache.js";

//
// Read the record type from a project record type.
//

export async function readRecordTypeContent(
  projectPath: string,
  recordType: ProjectRecordType,
  vars: RecordTypeContentVariables
) {
  // If this is a local record type, read the file.
  if ("path" in recordType) {
    return await tryReadLocalRecordTypeContent(
      projectPath,
      recordType.path,
      vars
    );
  }

  // Otherwise, try to fetch from cache.
  const {entity, recordId, versionHash} = recordType;
  const cachedRecord = await tryReadCacheRecordTypeContent(versionHash);
  if (cachedRecord) {
    return cachedRecord.content;
  }

  // Otherwise, fetch and cache.
  const record = await tryFetchAndCacheRecordTypeVersion(
    entity,
    recordId,
    versionHash
  );
  return record?.content;
}

//
// Read local schema.
//

export interface RecordTypeContentVariables {
  entity: string;
  recordId: string;
}

export async function tryReadLocalRecordTypeContent(
  projectPath: string,
  filePath: string,
  vars: RecordTypeContentVariables
) {
  try {
    const fullFilePath = path.join(projectPath, filePath);
    const contentJson = await fs.readFile(fullFilePath, {encoding: "utf-8"});

    const patchedContentJson = reduce(
      vars,
      (result, value, key) =>
        result.replaceAll(`"{var:${snakeCase(key)}}"`, `"${value}"`),
      contentJson
    );

    const contentEncoded = JSON.parse(patchedContentJson);
    const contentDecoded = IO.decode(TypeRecordContent, contentEncoded);
    const contentRoundtrip = IO.encode(TypeRecordContent, contentDecoded);

    if (!isMatch(contentRoundtrip, contentEncoded)) {
      throw new Error("Type roundtrip failure.");
    }

    return contentDecoded;
  } catch (err) {
    return undefined;
  }
}

//
// Read cache schema.
//

async function tryReadCacheRecordTypeContent(versionHash: string) {
  try {
    const recordJson = await readFromCache(versionHash);
    const recordEncoded = JSON.parse(recordJson);
    return IO.decode(TypeRecord, recordEncoded);
  } catch (err) {
    return undefined;
  }
}

//
// Fetch remote schemas.
//

function buildClient(entity: string) {
  return Client.discover(entity, new AbortController().signal);
}

const buildClientMemoized = memoize(buildClient);

export async function tryFetchRecordType(entity: string, recordId: string) {
  try {
    const client = await buildClientMemoized(entity);
    const {record} = await client.getRecord(
      AnyRecord,
      TypeRecord,
      entity,
      recordId
    );
    return record;
  } catch (err) {
    return undefined;
  }
}

async function tryFetchAndCacheRecordTypeVersion(
  entity: string,
  recordId: string,
  versionHash: string
) {
  // Fetch the record.
  const record = await tryFetchRecordTypeVersion(entity, recordId, versionHash);
  if (!record) {
    return undefined;
  }

  // Cache it.
  const encodedRecord = IO.encode(TypeRecord, record);
  const recordJson = JSON.stringify(encodedRecord);
  await writeToCache(versionHash, recordJson);

  return record;
}

export async function tryFetchRecordTypeVersion(
  entity: string,
  recordId: string,
  versionHash: string
) {
  try {
    const client = await buildClientMemoized(entity);
    const {record} = await client.getRecordVersion(
      AnyRecord,
      TypeRecord,
      entity,
      recordId,
      versionHash
    );

    return record;
  } catch (err) {
    return undefined;
  }
}
