import {Constants} from "../../constants.js";
import * as IO from "../../helpers/io.js";
import {EntityLink} from "../links/entityLink.js";
import {RecordLink} from "../links/recordLink.js";
import {Record, VersionHash} from "../records/record.js";
import {RecordKey} from "../records/recordKey.js";
import {RecordType} from "../records/recordType.js";

//
// Model.
//

export enum StandingDecision {
  UNDECIDED = "undecided",
  ALLOW = "allow",
  BLOCK = "block",
}

const RStandingDecision = IO.weakEnumeration(StandingDecision);

export const RStandingRecordContent = IO.object({
  publisher: EntityLink.io(),
  decision: RStandingDecision,
});

export const [standingRecordType, RStandingRecordType] = RecordType.full(
  Constants.systemEntity,
  "0a629cece93044d88414e9039874b297",
  "c2a2ace364b599e175562077f68196df8171a0e4d05bd47949e04bbf00241c09",
  RStandingRecordContent
);

export const RStandingRecord = Record.io(
  standingRecordType,
  RStandingRecordType,
  RStandingRecordContent
);

export interface StandingRecord extends IO.TypeOf<typeof RStandingRecord> {}
export interface StandingRecordContent
  extends IO.TypeOf<typeof RStandingRecordContent> {}
export const StandingRecord = Record.ioClean<StandingRecord>(RStandingRecord);

export type StandingRecordLink = RecordLink<StandingRecord>;
export type StandingRecordKey = RecordKey<StandingRecord>;
export type StandingVersionHash = VersionHash<StandingRecord>;
