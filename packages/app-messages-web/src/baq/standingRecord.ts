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
  /** The entity to qualify. */
  publisher: EntityLink;

  /** The current standing of the publisher. */
  decision: TagLink<"allow"> | TagLink<"block">;
};

const RStandingRecordContent: IO.RType<StandingRecordContent> = IO.object({
  publisher: EntityLink.io(),
  decision: IO.union([TagLink.io("allow"), TagLink.io("block")]),
});

const [standingRecordType, RStandingRecordType] = RecordType.full(
  "system.baq.dev",
  "0a629cece93044d88414e9039874b297",
  "c2a2ace364b599e175562077f68196df8171a0e4d05bd47949e04bbf00241c09",
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
