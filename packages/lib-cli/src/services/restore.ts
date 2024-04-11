import map from "lodash/map.js";
import {ProfileFile} from "./files/profileFile.js";
import {ProjectFile} from "./files/projectFile.js";
import {resetProjectFiles} from "./projectFiles.js";
import {maybeRestoreAuthentication} from "./restoreAuthentication.js";
import {restoreRecordType} from "./restoreRecordType.js";
import {maybeRestoreStore} from "./restoreStore.js";

export async function restoreProject(
  projectFile: ProjectFile,
  profileFile: ProfileFile | undefined
) {
  // Prepare the project directory.
  await resetProjectFiles(projectFile);

  // Restore all project record types in parallel.
  await Promise.all(
    map(projectFile.project.recordTypes, (value, key) =>
      restoreRecordType(projectFile, profileFile, key, value)
    )
  );

  // Restore the store if needed.
  await Promise.all([
    maybeRestoreStore(projectFile),
    maybeRestoreAuthentication(projectFile),
  ]);
}
