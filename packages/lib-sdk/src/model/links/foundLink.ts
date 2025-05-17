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

interface FoundLinkBase {
  path: string;
  pointer: string;
}

export interface TagFoundLink extends FoundLinkBase {
  type: FoundLinkType.TAG;
  value: TagLink<string>;
}

export interface BlobFoundLink extends FoundLinkBase {
  type: FoundLinkType.BLOB;
  value: BlobLink<string>;
}

export interface EntityFoundLink extends FoundLinkBase {
  type: FoundLinkType.ENTITY;
  value: EntityLink;
}

export interface RecordFoundLink extends FoundLinkBase {
  type: FoundLinkType.RECORD;
  value: RecordLink<AnyRecord>;
}

export interface VersionFoundLink extends FoundLinkBase {
  type: FoundLinkType.VERSION;
  value: VersionLink;
}

export type FoundLink =
  | TagFoundLink
  | BlobFoundLink
  | EntityFoundLink
  | RecordFoundLink
  | VersionFoundLink;
