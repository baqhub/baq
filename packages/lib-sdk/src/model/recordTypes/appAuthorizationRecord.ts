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
    Constants.typesEntity,
    "378dae797f404dcc9b7446d6d4212d36",
    "33cdd523b78b4fde6021104ab2b4466a99f8d112871347da45339f5200635a97",
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
