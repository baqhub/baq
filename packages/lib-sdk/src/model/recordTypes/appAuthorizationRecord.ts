import {Constants} from "../../constants.js";
import * as IO from "../../helpers/io.js";
import {RecordLink} from "../links/recordLink.js";
import {Record, VersionHash} from "../records/record.js";
import {RecordKey} from "../records/recordKey.js";
import {RecordType} from "../records/recordType.js";
import {AppRecord} from "./appRecord.js";
import {RAppScopes} from "./appScopes.js";

//
// Model.
//

const AppAuthorizationRecordContent = IO.object({
  app: RecordLink.io(AppRecord),
  scopeGrant: RAppScopes,
});

const [appAuthorizationRecordType, RAppAuthorizationRecordType] =
  RecordType.full(
    Constants.systemEntity,
    "378dae797f404dcc9b7446d6d4212d36",
    "f0dd112bebccb55f72c9feb0fd834e6c53ec29c23577f294ac87bdce06d389c3",
    AppAuthorizationRecordContent
  );

const RAppAuthorizationRecord = Record.io(
  appAuthorizationRecordType,
  RAppAuthorizationRecordType,
  AppAuthorizationRecordContent
);

export interface AppAuthorizationRecord
  extends IO.TypeOf<typeof RAppAuthorizationRecord> {}
export const AppAuthorizationRecord = Record.ioClean<AppAuthorizationRecord>(
  RAppAuthorizationRecord
);

export type AppAuthorizationRecordLink = RecordLink<AppAuthorizationRecord>;
export type AppAuthorizationRecordKey = RecordKey<AppAuthorizationRecord>;
export type AppAuthorizationVersionHash = VersionHash<AppAuthorizationRecord>;

//
// I/O.
//

export function buildAppAuthorizationRecord(appRecord: AppRecord) {
  return AppAuthorizationRecord.new(appRecord.author.entity, {
    app: Record.toLink(appRecord),
    scopeGrant: appRecord.content.scopeRequest,
  });
}
