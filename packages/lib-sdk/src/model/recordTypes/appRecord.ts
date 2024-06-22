import {Constants} from "../../constants.js";
import * as IO from "../../helpers/io.js";
import {AnyBlobLink} from "../links/blobLink.js";
import {RecordLink} from "../links/recordLink.js";
import {Record, VersionHash} from "../records/record.js";
import {RecordKey} from "../records/recordKey.js";
import {RecordType} from "../records/recordType.js";
import {RAppScopes} from "./appScopes.js";

//
// Model.
//

const RAppRecordUris = IO.intersection([
  IO.object({
    redirect: IO.string,
  }),
  IO.partialObject({
    notify: IO.string,
    website: IO.string,
  }),
]);

const AppRecordContent = IO.intersection([
  IO.object({
    name: IO.string,
    uris: RAppRecordUris,
    scopeRequest: RAppScopes,
  }),
  IO.partialObject({
    icon: AnyBlobLink.io(),
    description: IO.string,
  }),
]);

const [appRecordType, RAppRecordType] = RecordType.full(
  Constants.typesEntity,
  "58d114d7dcd24b1aa1ccbbccfe77634a",
  "cd72d7677cc0478ad6a6362e8ace07584223637e53655685b41c24ae3452e0ba",
  AppRecordContent
);

const RAppRecord = Record.io(appRecordType, RAppRecordType, AppRecordContent);

export interface AppRecord extends IO.TypeOf<typeof RAppRecord> {}
export interface AppRecordContent extends IO.TypeOf<typeof AppRecordContent> {}
export const AppRecord = Record.ioClean<AppRecord>(RAppRecord);

export type AppRecordLink = RecordLink<AppRecord>;
export type AppRecordKey = RecordKey<AppRecord>;
export type AppVersionHash = VersionHash<AppRecord>;
