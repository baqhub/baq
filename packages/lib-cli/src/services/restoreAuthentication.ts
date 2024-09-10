import camelCase from "lodash/camelCase.js";
import {pascalCase} from "../helpers/case.js";
import {ProjectRecordTypeScope} from "../model/project.js";
import {
  AuthenticationFileVariables,
  writeAuthenticationFile,
} from "./files/authenticationFile.js";
import {
  ProjectFile,
  projectFileToProjectFilesPath,
} from "./files/projectFile.js";

type ScopeRequest = Record<ProjectRecordTypeScope, ReadonlyArray<string>>;
const defaultScopes: ReadonlyArray<ProjectRecordTypeScope> = ["read", "write"];

export async function maybeRestoreAuthentication(projectFile: ProjectFile) {
  const {project} = projectFile;
  const {name, description, websiteUrl, type, recordTypes} = project;

  // Build imports for each record type.
  const recordTypeNames = Object.keys(recordTypes);

  const recordTypesImport = recordTypeNames
    .map(
      n => `import {${pascalCase(n)}Record} from "./${camelCase(n)}Record.js";`
    )
    .join("\n");

  // Scope request.
  const intermediateScopeRequest = recordTypeNames.reduce(
    (result, recordTypeName) => {
      const recordType = recordTypes[recordTypeName];
      if (!recordType) {
        return result;
      }

      const link = `${pascalCase(recordTypeName)}Record.link`;

      const scopes = recordType.scopes || defaultScopes;
      return scopes.reduce((r, scope) => {
        return {
          ...r,
          [scope]: [...(r[scope] || []), link],
        };
      }, result);
    },
    {} as ScopeRequest
  );

  const scopeRequest = Object.entries(intermediateScopeRequest).reduce(
    (result, [scope, links]) => {
      return result + `${scope}: [${links.join(", ")}],`;
    },
    ""
  );

  // Write the file.
  const vars: AuthenticationFileVariables = {
    appName: name,
    appDescription: maybeJsonProperty("description", description),
    appWebsiteUrl: maybeJsonProperty("website", websiteUrl),
    recordTypesImport,
    scopeRequest,
  };

  const projectFilesPath = projectFileToProjectFilesPath(projectFile);
  await writeAuthenticationFile(type, projectFilesPath, vars);
}

function maybeJsonProperty(propertyName: string, value: string | undefined) {
  if (!value) {
    return undefined;
  }

  return `${propertyName}: ${JSON.stringify(value)},`;
}
