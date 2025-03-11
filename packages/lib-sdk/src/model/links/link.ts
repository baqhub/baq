import {AnyRecord} from "../records/record.js";
import {BlobLink} from "./blobLink.js";
import {EntityLink} from "./entityLink.js";
import {RecordLink} from "./recordLink.js";
import {TagLink} from "./tagLink.js";
import {VersionLink} from "./versionLink.js";

//
// Model.
//

export enum LinkType {
  TAG = "TAG",
  BLOB = "BLOB",
  ENTITY = "ENTITY",
  RECORD = "RECORD",
  VERSION = "VERSION",
}

interface LinkTag {
  type: LinkType.TAG;
  path: string;
  value: TagLink<string>;
}

interface LinkBlob {
  type: LinkType.BLOB;
  path: string;
  value: BlobLink<string>;
}

interface LinkEntity {
  type: LinkType.ENTITY;
  path: string;
  value: EntityLink;
}

interface LinkRecord {
  type: LinkType.RECORD;
  path: string;
  value: RecordLink<AnyRecord>;
}

interface LinkVersion {
  type: LinkType.VERSION;
  path: string;
  value: VersionLink;
}

export type Link = LinkTag | LinkBlob | LinkEntity | LinkRecord | LinkVersion;
