import {IO} from "@baqhub/sdk";

//
// Model.
//

const RProjectRecordTypeScope = IO.union([
  IO.literal("read"),
  IO.literal("write"),
  IO.literal("subscribe"),
]);

const RLocalProjectRecordType = IO.object({
  path: IO.string,
  recordId: IO.string,
  versionHash: IO.optional(IO.string),
  contentHash: IO.optional(IO.string),
});

const RRemoteProjectRecordType = IO.object({
  entity: IO.string,
  recordId: IO.string,
  versionHash: IO.string,
});

const RProjectRecordType = IO.intersection([
  IO.union([RLocalProjectRecordType, RRemoteProjectRecordType]),
  IO.partialObject({
    scopes: IO.optional(IO.readonlyArray(RProjectRecordTypeScope)),
  }),
]);

export type ProjectRecordTypeScope = IO.TypeOf<typeof RProjectRecordTypeScope>;
export type LocalProjectRecordType = IO.TypeOf<typeof RLocalProjectRecordType>;
export type ProjectRecordType = IO.TypeOf<typeof RProjectRecordType>;

export enum ProjectType {
  JS = "js",
  JS_REACT = "js-react",
  TS = "ts",
  TS_REACT = "ts-react",
}

const RProjectRaw = IO.intersection([
  IO.object({
    name: IO.string,
    type: IO.enumeration(ProjectType),
    path: IO.string,
    recordTypes: IO.record(IO.string, RProjectRecordType),
  }),
  IO.partialObject({
    description: IO.string,
    websiteUrl: IO.string,
  }),
]);

export interface Project extends IO.TypeOf<typeof RProjectRaw> {}
export const RProject = IO.clean<Project>(RProjectRaw);

//
// I/O.
//

export function buildProject(
  name: string,
  type: ProjectType,
  path: string
): Project {
  return {
    name,
    type,
    path,
    recordTypes: {},
  };
}

export function addTypeToProject(
  project: Project,
  name: string,
  projectRecordType: ProjectRecordType
): Project {
  return {
    ...project,
    recordTypes: {
      ...project.recordTypes,
      [name]: projectRecordType,
    },
  };
}

export function removeTypeFromProject(project: Project, name: string): Project {
  const {[name]: _, ...recordTypes} = project.recordTypes;
  return {
    ...project,
    recordTypes,
  };
}
