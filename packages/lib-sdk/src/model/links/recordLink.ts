/* eslint-disable @typescript-eslint/no-unused-vars */
import * as IO from "../../helpers/io.js";
import {AnyRecord, CleanRecordType, Record} from "../records/record.js";
import {RecordKey} from "../records/recordKey.js";
import {
  RAnyRecordType,
  RRecordType,
  RecordType,
} from "../records/recordType.js";

//
// Model.
//

export interface RecordLink<T extends AnyRecord> {
  entity: string;
  originalEntity?: string;
  versionCreatedAt?: Date;
  recordId: string;
  _type?: T;
}

export type AnyRecordLink = RecordLink<AnyRecord>;

//
// Runtime model.
//

export class RRecordLinkClass<T extends RAnyRecordType> extends IO.Type<
  RecordLink<Record<IO.TypeOf<T>, any>>,
  unknown,
  unknown
> {
  constructor(_type?: T) {
    const model = IO.dualObject(
      {
        entity: IO.string,
        recordId: IO.string,
      },
      {
        originalEntity: IO.string,
        versionCreatedAt: IO.isoDate,
      }
    );

    super("RecordLink", model.is, model.validate, model.encode);
  }
}

function recordLink<T extends AnyRecord>(type?: CleanRecordType<T>) {
  return new RRecordLinkClass(type?.RType);
}

function recordLinkOf<E extends string, R extends string>(
  _entity: E,
  _recordId: R
) {
  type RecordType = RRecordType<any, any, E, R>;
  return new RRecordLinkClass({} as RecordType);
}

export type RecordLinkOf<E extends string, R extends string> = RecordLink<
  Record<RecordType<any, any, E, R>, any>
>;

const RAnyRecordLink = recordLink();

//
// I/O.
//

function buildRecordLink(entity: string, recordId: string): AnyRecordLink {
  return {entity, recordId};
}

function linkToKey<T extends AnyRecord>(link: RecordLink<T>): RecordKey<T> {
  return `${link.entity}+${link.recordId}`;
}

function isLinkedRecord<R extends AnyRecord, L extends R>(
  record: R,
  recordLink: RecordLink<L>
): record is L {
  return (
    record.author.entity === recordLink.entity &&
    record.id === recordLink.recordId
  );
}

function findLinkedRecord<R extends AnyRecord, L extends R>(
  records: ReadonlyArray<R>,
  link: RecordLink<L>
): L | undefined {
  function isLink(record: R): record is L {
    return isLinkedRecord(record, link);
  }

  return records.find(isLink);
}

function isSameRecordLink(link1: AnyRecordLink, link2: AnyRecordLink) {
  return link1.entity === link2.entity && link1.recordId === link2.recordId;
}

//
// Exports.
//

export const RecordLink = {
  io: recordLink,
  ioOf: recordLinkOf,
  new: buildRecordLink,
  toKey: linkToKey,
  isRecord: isLinkedRecord,
  findRecord: findLinkedRecord,
  isSame: isSameRecordLink,
};

export const AnyRecordLink = {
  io: () => RAnyRecordLink,
};
