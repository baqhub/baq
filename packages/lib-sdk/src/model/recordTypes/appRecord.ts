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
  Constants.systemEntity,
  "58d114d7dcd24b1aa1ccbbccfe77634a",
  "df617207dd07be4efd1837ae5b364c018990868085663ac905dc1ba68c75e247",
  AppRecordContent
);

const RAppRecord = Record.io(appRecordType, RAppRecordType, AppRecordContent);

export interface AppRecord extends IO.TypeOf<typeof RAppRecord> {}
export interface AppRecordContent extends IO.TypeOf<typeof AppRecordContent> {}
export const AppRecord = Record.ioClean<AppRecord>(RAppRecord);

export type AppRecordLink = RecordLink<AppRecord>;
export type AppRecordKey = RecordKey<AppRecord>;
export type AppVersionHash = VersionHash<AppRecord>;
