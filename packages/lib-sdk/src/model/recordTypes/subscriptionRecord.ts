import {Constants} from "../../constants.js";
import * as IO from "../../helpers/io.js";
import {EntityLink} from "../links/entityLink.js";
import {RecordLink} from "../links/recordLink.js";
import {
  Record,
  VersionHash,
  subscriptionRecordContainer,
} from "../records/record.js";
import {RecordKey} from "../records/recordKey.js";
import {RecordType} from "../records/recordType.js";

//
// Model.
//

export const RSubscriptionRecordContent = IO.object({
  publisher: EntityLink.io(),
  recordType: RecordLink.ioOf(
    "schemas.baq.dev",
    "ba132234fc384e7b8d61bcd049e9f84f"
  ),
});

export const [subscriptionRecordType, RSubscriptionRecordType] =
  RecordType.full(
    Constants.typesEntity,
    "138304ac29db432f838ad7b178f3cede",
    "044b9c32c0cc17cf668a6f720e8da186446bb3adbce1cb93a4c459258e3a1b90",
    RSubscriptionRecordContent
  );

export const RSubscriptionRecord = Record.io(
  subscriptionRecordType,
  RSubscriptionRecordType,
  RSubscriptionRecordContent
);

export interface SubscriptionRecord
  extends IO.TypeOf<typeof RSubscriptionRecord> {}
export interface SubscriptionRecordContent
  extends IO.TypeOf<typeof RSubscriptionRecordContent> {}
export const SubscriptionRecord =
  Record.ioClean<SubscriptionRecord>(RSubscriptionRecord);

export type SubscriptionRecordLink = RecordLink<SubscriptionRecord>;
export type SubscriptionRecordKey = RecordKey<SubscriptionRecord>;
export type SubscriptionVersionHash = VersionHash<SubscriptionRecord>;

subscriptionRecordContainer.SubscriptionRecord = SubscriptionRecord;
