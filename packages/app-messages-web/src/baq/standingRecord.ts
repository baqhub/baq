/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import {
  EntityLink,
  IO,
  Record,
  RecordKey,
  RecordLink,
  RecordType,
  TagLink,
  VersionHash,
} from "@baqhub/sdk";

//
// Model.
//

export type StandingRecordContent = {
  decision: TagLink<"allow"> | TagLink<"block">;
  publisher: EntityLink;
};

const RStandingRecordContent: IO.RType<StandingRecordContent> = IO.object({
  decision: IO.union([TagLink.io("allow"), TagLink.io("block")]),
  publisher: EntityLink.io(),
});

const [standingRecordType, RStandingRecordType] = RecordType.full(
  "types.baq.dev",
  "0a629cece93044d88414e9039874b297",
  "6888ab038b51719c6ca1cd27696e6ba6ee7139dc489e61dc5899d2dab63d85f5",
  RStandingRecordContent
);

const RStandingRecord = Record.io(
  standingRecordType,
  RStandingRecordType,
  RStandingRecordContent
);

export interface StandingRecord extends IO.TypeOf<typeof RStandingRecord> {}
export const StandingRecord = Record.ioClean<StandingRecord>(RStandingRecord);
export type StandingRecordLink = RecordLink<StandingRecord>;
export type StandingRecordKey = RecordKey<StandingRecord>;
export type StandingVersionHash = VersionHash<StandingRecord>;
