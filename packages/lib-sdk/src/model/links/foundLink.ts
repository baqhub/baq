import {AnyRecord} from "../records/record.js";
import {BlobLink} from "./blobLink.js";
import {EntityLink} from "./entityLink.js";
import {RecordLink} from "./recordLink.js";
import {TagLink} from "./tagLink.js";
import {VersionLink} from "./versionLink.js";

//
// Model.
//

export enum FoundLinkType {
  TAG = "TAG",
  BLOB = "BLOB",
  ENTITY = "ENTITY",
  RECORD = "RECORD",
  VERSION = "VERSION",
}

interface FoundLinkTag {
  type: FoundLinkType.TAG;
  path: string;
  value: TagLink<string>;
}

interface FoundLinkBlob {
  type: FoundLinkType.BLOB;
  path: string;
  value: BlobLink<string>;
}

interface FoundLinkEntity {
  type: FoundLinkType.ENTITY;
  path: string;
  value: EntityLink;
}

interface FoundLinkRecord {
  type: FoundLinkType.RECORD;
  path: string;
  value: RecordLink<AnyRecord>;
}

interface FoundLinkVersion {
  type: FoundLinkType.VERSION;
  path: string;
  value: VersionLink;
}

export type FoundLink =
  | FoundLinkTag
  | FoundLinkBlob
  | FoundLinkEntity
  | FoundLinkRecord
  | FoundLinkVersion;
