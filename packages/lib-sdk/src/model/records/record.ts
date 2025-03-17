import snakeCase from "lodash/snakeCase.js";
import * as IO from "../../helpers/io.js";
import {Uuid} from "../../helpers/uuid.js";
import {RBlobLinkName} from "../links/blobLink.js";
import {EntityLink, REntityLinkName} from "../links/entityLink.js";
import {FoundLink, FoundLinkType} from "../links/foundLink.js";
import {
  AnyRecordLink,
  RecordLink,
  RRecordLinkName,
} from "../links/recordLink.js";
import {RTagLinkName} from "../links/tagLink.js";
import {RVersionLinkName} from "../links/versionLink.js";
import type {SubscriptionRecord} from "../recordTypes/subscriptionRecord.js";
import {TypeRecord} from "../recordTypes/typeRecord.js";
import {RecordKey} from "./recordKey.js";
import {RecordPermissions, RRecordPermissions} from "./recordPermissions.js";
import {AnyRecordType, RAnyRecordType} from "./recordType.js";

//
// Model.
//

export type RecordId<T extends AnyRecord | NoContentRecord> = string & {
  _type?: T;
};

export type VersionHash<T extends AnyRecord | NoContentRecord> = string & {
  _type?: T;
};

export enum RecordSource {
  SELF = "self",
  RESOLUTION = "resolution",
  NOTIFICATION = "notification",
  NOTIFICATION_UNKNOWN = "notification_unknown",
  SUBSCRIPTION = "subscription",
  PROXY = "proxy",
}

export enum RecordMode {
  SYNCED = "synced",
  LOCAL = "local",
}

export enum NoContentRecordAction {
  DELETE = "delete",
  LOCAL = "local",
  REPORT = "report",
  LEAVE = "leave",
}

export interface RecordVersion<T extends AnyRecord | NoContentRecord> {
  author: EntityLink;
  hash: VersionHash<T> | undefined;
  hashSignature: string | undefined;
  createdAt: Date;
  receivedAt: Date | undefined;
  parentHash?: string;
}

export interface Record<T extends AnyRecordType, C> {
  author: EntityLink;
  id: RecordId<Record<T, C>>;
  source: `${RecordSource}`;

  createdAt: Date;
  receivedAt: Date | undefined;
  version: RecordVersion<Record<T, C>> | undefined;
  permissions: RecordPermissions;

  type: T;
  content: C;
  mode: `${RecordMode}`;
}

export type AnyRecord = Record<AnyRecordType, any>;
export type AnyEventRecord = AnyRecord | NoContentRecord;
export type UnknownRecord = Record<never, never>;

export interface NoContentRecord {
  author: EntityLink;
  id: RecordId<NoContentRecord>;
  source: `${RecordSource}`;

  createdAt: Date;
  receivedAt: Date | undefined;
  version: RecordVersion<NoContentRecord> | undefined;
  permissions: RecordPermissions;

  type: AnyRecordType;
  noContent: {
    action: `${NoContentRecordAction}`;
    links?: unknown;
  };
  mode: `${RecordMode}`;
}

export interface CleanRecordType<T extends AnyRecord>
  extends IO.Type<T, any, unknown> {
  RType: IO.Type<T["type"], any, unknown>;
  RContent: IO.Type<T["content"], any, unknown>;
  type: T["type"];
  link: RecordLink<TypeRecord>;
  new: (entity: string, content: T["content"], options?: NewRecordOptions) => T;
  update: (
    entity: string,
    record: T,
    content: T["content"],
    options?: NewRecordOptions
  ) => T;
  subscribe: (
    entity: string,
    publisherEntity: string,
    options?: NewSubscriptionOptions
  ) => SubscriptionRecord;
}

//
// Trick to avoid import loop.
//

interface SubscriptionRecordContainer {
  SubscriptionRecord: typeof SubscriptionRecord;
}

export const subscriptionRecordContainer: SubscriptionRecordContainer = {
  SubscriptionRecord: null as any,
};

//
// Runtime model.
//

const RRecordSource = IO.weakEnumeration(RecordSource);
const RRecordMode = IO.weakEnumeration(RecordMode);

const RRecordVersion: IO.Type<RecordVersion<any>> = IO.intersection([
  IO.object({
    author: EntityLink.io(),
    hash: IO.union([IO.undefined, IO.string]),
    hashSignature: IO.union([IO.undefined, IO.string]),
    createdAt: IO.isoDate,
    receivedAt: IO.union([IO.undefined, IO.isoDate]),
  }),
  IO.partialObject({
    parentHash: IO.string,
  }),
]);

export class RecordClassBase<
  T extends RAnyRecordType,
  C extends IO.Any,
> extends IO.Type<Record<IO.TypeOf<T>, IO.TypeOf<C>>, unknown, unknown> {
  constructor(
    public RType: T,
    public RContent: C
  ) {
    const model = IO.object({
      author: EntityLink.io(),
      id: IO.string,
      source: IO.defaultValue(RRecordSource, RecordSource.PROXY),
      createdAt: IO.isoDate,
      receivedAt: IO.union([IO.undefined, IO.isoDate]),
      version: IO.union([IO.undefined, RRecordVersion]),
      permissions: RRecordPermissions,

      type: RType,
      content: RContent,
      mode: IO.defaultValue(RRecordMode, RecordMode.SYNCED),
    });

    super("Record", model.is, model.validate, model.encode);
    this.model = model;
  }

  model: IO.Type<Record<IO.TypeOf<T>, IO.TypeOf<C>>, unknown, unknown>;
}

class RecordClass<
  T extends RAnyRecordType,
  C extends IO.Any,
> extends RecordClassBase<T, C> {
  constructor(
    public type: IO.TypeOf<T>,
    RType: T,
    RContent: C
  ) {
    super(RType, RContent);

    this.link = {
      entity: type.entity,
      recordId: type.recordId,
    };
  }

  link: RecordLink<TypeRecord>;

  new(entity: string, content: IO.TypeOf<C>, options?: NewRecordOptions) {
    return buildRecord(this, entity, this.type, content, options);
  }

  update(
    entity: string,
    record: Record<IO.TypeOf<T>, IO.TypeOf<C>>,
    content: IO.TypeOf<C>,
    options?: NewRecordOptions
  ) {
    return buildRecordUpdate(this, entity, record, content, options);
  }

  subscribe(
    entity: string,
    publisherEntity: string,
    options?: NewSubscriptionOptions
  ): SubscriptionRecord {
    return buildSubscriptionRecord(entity, publisherEntity, this.type, options);
  }
}

function record<T extends RAnyRecordType, C extends IO.Any>(
  type: IO.TypeOf<T>,
  RType: T,
  RContent: C
) {
  return new RecordClass(type, RType, RContent);
}

function cleanRecord<T extends AnyRecord>(RRecord: CleanRecordType<T>) {
  return RRecord;
}

export const AnyRecord = new RecordClassBase(RAnyRecordType, IO.any);
export type RAnyRecord = IO.Type<AnyRecord, unknown, unknown>;

const RNoContentRecordAction = IO.weakEnumeration(NoContentRecordAction);

export const RNoContentRecord: IO.Type<NoContentRecord> = IO.object({
  author: EntityLink.io(),
  id: IO.string,
  source: RRecordSource,

  createdAt: IO.isoDate,
  receivedAt: IO.union([IO.undefined, IO.isoDate]),
  version: IO.union([IO.undefined, RRecordVersion]),
  permissions: RRecordPermissions,

  type: RAnyRecordType,
  noContent: IO.dualObject(
    {action: RNoContentRecordAction},
    {links: IO.unknown}
  ),
  mode: IO.defaultValue(RRecordMode, RecordMode.SYNCED),
});

export type RAnyEventRecord =
  | RAnyRecord
  | IO.Type<NoContentRecord, unknown, unknown>
  | IO.Type<AnyRecord | NoContentRecord, unknown, unknown>;

//
// I/O.
//

export interface NewRecordOptions {
  id?: string;
  createdAt?: Date;
  permissions?: RecordPermissions;
  mode?: `${RecordMode}`;
}

export interface UpdateRecordOptions {
  permissions?: RecordPermissions;
}

function buildRecord<R extends RAnyRecord>(
  model: R,
  entity: string,
  type: IO.TypeOf<R>["type"],
  content: IO.TypeOf<R>["content"],
  {id, createdAt, permissions, mode}: NewRecordOptions = {}
) {
  const record: IO.TypeOf<R> = {
    author: {entity},
    id: id || Uuid.new(),
    source: "self",

    createdAt: createdAt || new Date(),
    receivedAt: undefined,
    version: undefined,
    permissions: permissions || RecordPermissions.private,

    type,
    content,
    mode: mode || RecordMode.SYNCED,
  };

  return IO.validate(model, record);
}

function buildRecordUpdate<R extends RAnyRecord>(
  model: R,
  entity: string,
  record: IO.TypeOf<R>,
  content: IO.TypeOf<R>["content"],
  {permissions}: UpdateRecordOptions = {}
) {
  if (record.source === "proxy") {
    throw new Error("Cannot update proxied record.");
  }

  // Make sure the new date is higher.
  // TODO: bound this and keep local server offset.
  const versionCreatedAt = record.version?.createdAt;
  const now = new Date();
  const newVersionCreatedAt =
    versionCreatedAt && versionCreatedAt > now
      ? new Date(versionCreatedAt.getTime() + 1)
      : now;

  const recordUpdate: IO.TypeOf<R> = {
    author: {entity: record.author.entity},
    id: record.id,
    source: "self",

    createdAt: record.createdAt,
    receivedAt: record.receivedAt,
    version: {
      author: {entity},
      hash: undefined,
      hashSignature: undefined,
      createdAt: newVersionCreatedAt,
      receivedAt: undefined,
      parentHash: record.version?.hash,
    },
    permissions: permissions || record.permissions,

    type: record.type,
    content,
    mode: record.mode,
  };

  return IO.validate(model, recordUpdate);
}

function buildNoContentRecord(
  entity: string,
  record: AnyRecord,
  action: `${NoContentRecordAction}` = NoContentRecordAction.DELETE
): NoContentRecord {
  if (record.source === "proxy") {
    throw new Error("Cannot delete proxied record.");
  }

  // Make sure the new date is higher.
  // TODO: bound this and keep local server offset.
  const versionCreatedAt = record.version?.createdAt;
  const now = new Date();
  const newVersionCreatedAt =
    versionCreatedAt && versionCreatedAt > now
      ? new Date(versionCreatedAt.getTime() + 1)
      : now;

  return {
    author: {entity: record.author.entity},
    id: record.id as any,
    source: "self",

    createdAt: record.createdAt,
    receivedAt: undefined,
    version: {
      author: {entity},
      hash: undefined,
      hashSignature: undefined,
      createdAt: newVersionCreatedAt,
      receivedAt: undefined,
      parentHash: record.version?.hash,
    },
    permissions: record.permissions,

    type: record.type,
    noContent: {action},
    mode: record.mode,
  };
}

export interface NewSubscriptionOptions {
  id?: RecordId<SubscriptionRecord>;
  readPermissions?: RecordPermissions["read"];
}

function buildSubscriptionRecord<R extends RAnyRecord>(
  entity: string,
  publisherEntity: string,
  type: IO.TypeOf<R>["type"],
  {id, readPermissions}: NewSubscriptionOptions = {}
): SubscriptionRecord {
  return buildRecord(
    subscriptionRecordContainer.SubscriptionRecord,
    entity,
    subscriptionRecordContainer.SubscriptionRecord.type,
    {
      publisher: {entity: publisherEntity},
      recordType: {
        entity: type.entity,
        recordId: type.recordId,
      },
    },
    {
      id,
      permissions: {
        read: readPermissions,
        notify: [{entity: publisherEntity}],
      },
    }
  );
}

//
// Helpers.
//

function isSameRecord(record1: AnyRecord, record2: AnyRecord) {
  return (
    record1.author.entity === record2.author.entity && record1.id === record2.id
  );
}

function isPublicRecord(record: AnyRecord) {
  return record.permissions.read === "public";
}

function recordHasType<T extends AnyRecord>(
  record: AnyRecord,
  type: CleanRecordType<T>
): record is T {
  return (
    record.type.entity === type.type.entity &&
    record.type.recordId === type.type.recordId
  );
}

function updateToSynced<T extends AnyRecord>(record: T): T {
  return {...record, mode: RecordMode.SYNCED};
}

function updateToSelf<T extends AnyRecord>(record: T): T {
  return {...record, source: RecordSource.SELF};
}

function updateToResolution<T extends AnyRecord>(record: T): T {
  return {...record, source: "resolution"};
}

function recordToKey<T extends AnyRecord | NoContentRecord>(
  record: T
): RecordKey<T> {
  return `${record.author.entity}+${record.id}`;
}

function recordToLink<T extends AnyRecord>(record: T): RecordLink<T> {
  return {
    entity: record.author.entity,
    recordId: record.id,
  };
}

function recordToVersionHash<T extends AnyRecord | NoContentRecord>(
  record: T
): VersionHash<T> {
  if (!record.version?.hash) {
    throw new Error("This record does not have a version.");
  }

  return record.version.hash as any;
}

function noContentRecordToLink(record: NoContentRecord): AnyRecordLink {
  return {
    entity: record.author.entity,
    recordId: record.id,
  };
}

function findLinksInRecord<T extends AnyRecord>(
  type: IO.Type<T, unknown, unknown>,
  record: T
) {
  type CombinedArrayType<T extends IO.Any> =
    | IO.ArrayType<T>
    | IO.ReadonlyArrayType<T>;

  type CombinedObjectType<T> = IO.InterfaceType<T> | IO.PartialType<T>;

  function findLinksInUnknown(
    type: IO.Any,
    value: unknown,
    path: string
  ): ReadonlyArray<FoundLink> {
    function findLinksInArray(
      type: CombinedArrayType<any>,
      value: ReadonlyArray<unknown>
    ) {
      return value.reduce((result: Array<FoundLink>, v) => {
        const links = findLinksInUnknown(type.type, v, `${path}[*]`);
        result.push(...links);
        return result;
      }, []);
    }

    function findLinksInMap(type: IO.DictionaryType<any, any>, value: object) {
      return Object.entries(value).reduce(
        (result: Array<FoundLink>, [key, v]) => {
          const links = findLinksInUnknown(
            type.codomain,
            v[key],
            `${path}['${snakeCase(key)}']`
          );

          result.push(...links);
          return result;
        },
        []
      );
    }

    function findLinksInObject(type: CombinedObjectType<any>, value: object) {
      return Object.entries(type.props).reduce(
        (result: Array<FoundLink>, [key, t]) => {
          const links = findLinksInUnknown(
            t as IO.Any,
            (value as any)[key],
            `${path}['${snakeCase(key)}']`
          );

          result.push(...links);
          return result;
        },
        []
      );
    }

    function findLinksInUnion(type: IO.UnionType<any>) {
      for (const t of type.types as IO.Any[]) {
        if (t.is(value)) {
          return findLinksInUnknown(t, value, path);
        }
      }

      return [];
    }

    function findLinksInIntersection(type: IO.IntersectionType<any>) {
      return type.types.reduce((result: Array<FoundLink>, t: IO.Any) => {
        const links = findLinksInUnknown(t, value, path);
        result.push(...links);
        return result;
      }, []);
    }

    if (type.name === RTagLinkName && type.is(value)) {
      return [{type: FoundLinkType.TAG, path, value}];
    }

    if (type.name === RBlobLinkName && type.is(value)) {
      return [{type: FoundLinkType.BLOB, path, value}];
    }

    if (type.name === REntityLinkName && type.is(value)) {
      return [{type: FoundLinkType.ENTITY, path, value}];
    }

    if (type.name === RRecordLinkName && type.is(value)) {
      return [{type: FoundLinkType.RECORD, path, value}];
    }

    if (type.name === RVersionLinkName && type.is(value)) {
      return [{type: FoundLinkType.VERSION, path, value}];
    }

    if (
      type instanceof IO.ReadonlyType ||
      type instanceof IO.ExactType ||
      type instanceof IO.RefinementType
    ) {
      return findLinksInUnknown(type.type, value, path);
    }

    if (type instanceof RecordClassBase) {
      return findLinksInUnknown(type.model, value, path);
    }

    if (
      (type instanceof IO.ArrayType || type instanceof IO.ReadonlyArrayType) &&
      Array.isArray(value)
    ) {
      return findLinksInArray(type, value);
    }

    if (
      type instanceof IO.DictionaryType &&
      typeof value === "object" &&
      value
    ) {
      return findLinksInMap(type, value);
    }

    if (
      (type instanceof IO.InterfaceType || type instanceof IO.PartialType) &&
      typeof value === "object" &&
      value
    ) {
      return findLinksInObject(type, value);
    }

    if (type instanceof IO.UnionType) {
      return findLinksInUnion(type);
    }

    if (type instanceof IO.IntersectionType) {
      return findLinksInIntersection(type);
    }

    return [];
  }

  return findLinksInUnknown(type, record, "$");
}

//
// Exports.
//

export const Record = {
  io: record,
  ioClean: cleanRecord,
  delete: buildNoContentRecord,
  isSame: isSameRecord,
  isPublic: isPublicRecord,
  hasType: recordHasType,
  toSynced: updateToSynced,
  toSelf: updateToSelf,
  toResolution: updateToResolution,
  toKey: recordToKey,
  toLink: recordToLink,
  toVersionHash: recordToVersionHash,
  noContentToLink: noContentRecordToLink,
  findLinks: findLinksInRecord,
};
