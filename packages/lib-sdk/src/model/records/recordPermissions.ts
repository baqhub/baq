import * as IO from "../../helpers/io.js";
import {EntityLink} from "../links/entityLink.js";

//
// Model.
//

type PermissionLink = EntityLink;

export interface RecordPermissions {
  read?: "public" | ReadonlyArray<PermissionLink>;
  write?: ReadonlyArray<PermissionLink>;
  notify?: ReadonlyArray<PermissionLink>;
}

//
// Runtime model.
//

const RPermissionLink = EntityLink.io();

export const RRecordPermissions: IO.Type<RecordPermissions> = IO.partialObject({
  read: IO.union([IO.literal("public"), IO.readonlyArray(RPermissionLink)]),
  write: IO.readonlyArray(RPermissionLink),
  notify: IO.readonlyArray(RPermissionLink),
});

//
// I/O.
//

const publicPermissions: RecordPermissions = {
  read: "public",
};

const privatePermissions: RecordPermissions = {};

function buildSimplePermissions(
  authorEntity: string,
  otherEntities: ReadonlyArray<string>
): RecordPermissions {
  const authorEntityLink = EntityLink.new(authorEntity);
  const otherEntityLinks = otherEntities.map(EntityLink.new);

  return {
    read: [authorEntityLink, ...otherEntityLinks],
  };
}

function buildReadonlyPermissions(
  authorEntity: string,
  otherEntities: ReadonlyArray<string>
): RecordPermissions {
  const authorEntityLink = EntityLink.new(authorEntity);
  const otherEntityLinks = otherEntities.map(EntityLink.new);

  return {
    read: [authorEntityLink, ...otherEntityLinks],
    write: [],
  };
}

function toReadEntities({read}: RecordPermissions) {
  if (!read || read === "public") {
    return [];
  }

  return read.map(l => l.entity);
}

export const RecordPermissions = {
  public: publicPermissions,
  private: privatePermissions,
  simple: buildSimplePermissions,
  readonly: buildReadonlyPermissions,
  toReadEntities,
};
