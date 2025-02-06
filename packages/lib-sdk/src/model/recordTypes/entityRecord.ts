import {Constants} from "../../constants.js";
import * as IO from "../../helpers/io.js";
import {RCredentialsAlgorithm} from "../core/credentialsAlgorithm.js";
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
  preference: IO.number,
  endpoints: REntityRecordServerEndpoints,
});

const REntityRecordProfile = IO.partialObject({
  avatar: AnyBlobLink.io(),
  name: IO.string,
  bio: IO.string,
  website: IO.string,
  location: IO.string,
});

const REntityRecordKey = IO.object({
  algorithm: RCredentialsAlgorithm,
  publicKey: IO.base64Bytes,
});

const EntityRecordContent = IO.object({
  previousEntities: IO.readonlyArray(IO.string),
  signingKeys: IO.readonlyArray(REntityRecordKey),
  profile: REntityRecordProfile,
  servers: IO.readonlyArray(REntityRecordServer),
});

const [entityRecordType, REntityRecordType] = RecordType.full(
  Constants.typesEntity,
  "80be958368dd414fabb9420647daa1ec",
  "5869ed5eb6b565b92990ecfda31b4eb7e837489cb4799a534c00e3fd6ca756e9",
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
