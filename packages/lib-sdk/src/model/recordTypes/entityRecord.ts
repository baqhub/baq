import {Constants} from "../../constants.js";
import * as IO from "../../helpers/io.js";
import {AnyBlobLink} from "../links/blobLink.js";
import {RecordLink} from "../links/recordLink.js";
import {Record, VersionHash} from "../records/record.js";
import {RecordKey} from "../records/recordKey.js";
import {RecordType} from "../records/recordType.js";

//
// Model.
//

const REntityRecordServerEndpoints = IO.object({
  auth: IO.string,
  records: IO.string,
  record: IO.string,
  recordVersions: IO.string,
  recordVersion: IO.string,
  newRecord: IO.string,
  recordBlob: IO.string,
  recordVersionBlob: IO.string,
  newBlob: IO.string,
  events: IO.string,
  newNotification: IO.string,
  serverInfo: IO.string,
});

const REntityRecordServer = IO.object({
  version: IO.literal("1.0.0"),
  preference: IO.Int,
  endpoints: REntityRecordServerEndpoints,
});

const REntityRecordProfile = IO.partialObject({
  avatar: AnyBlobLink.io(),
  name: IO.string,
  bio: IO.string,
  website: IO.string,
  location: IO.string,
});

const EntityRecordContent = IO.object({
  entity: IO.string,
  previousEntities: IO.readonlyArray(IO.string),
  profile: REntityRecordProfile,
  servers: IO.readonlyArray(REntityRecordServer),
});

const [entityRecordType, REntityRecordType] = RecordType.full(
  Constants.typesEntity,
  "80be958368dd414fabb9420647daa1ec",
  "7e37a172b5e5f0bfaacb0b4aef6958da2f06427c3a90bc1417d05b1bf4c4d76f",
  EntityRecordContent
);

export interface EntityRecordType extends IO.TypeOf<typeof REntityRecordType> {}

export const REntityRecord = Record.io(
  entityRecordType,
  REntityRecordType,
  EntityRecordContent
);

export interface EntityRecord extends IO.TypeOf<typeof REntityRecord> {}
export const EntityRecord = Record.ioClean<EntityRecord>(REntityRecord);

export type EntityRecordLink = RecordLink<EntityRecord>;
export type EntityRecordKey = RecordKey<EntityRecord>;
export type EntityVersionHash = VersionHash<EntityRecord>;

export type EntityRecordServerEndpoint =
  keyof EntityRecord["content"]["servers"][number]["endpoints"];

//
// I/O.
//

interface ProfileUpdate {
  avatar?: AnyBlobLink;
  name?: string;
}

export function buildEntityProfileUpdate(
  record: EntityRecord,
  profileUpdate: ProfileUpdate
) {
  return EntityRecord.update(record.author.entity, record, {
    ...record.content,
    profile: {
      ...record.content.profile,
      ...profileUpdate,
    },
  });
}
