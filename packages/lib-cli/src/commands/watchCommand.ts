/* eslint-disable no-constant-condition */
import {Async} from "@baqhub/sdk";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import {ProgramError, handleErrors} from "../helpers/error.js";
import {Program} from "../index.js";
import {LocalProjectRecordType} from "../model/project.js";
import {
  ProfileFile,
  tryFindProfileFile,
} from "../services/files/profileFile.js";
import {
  ProjectFile,
  tryFindProjectFile,
} from "../services/files/projectFile.js";
import {restoreProject} from "../services/restore.js";
import {restoreRecordType} from "../services/restoreRecordType.js";

export async function watchCommand(program: Program) {
  await handleErrors(
    program,
    async () => {
      let iteration = 0;

      while (true) {
        const projectFile = await tryFindProjectFile(path.resolve("."));
        if (!projectFile) {
          throw new ProgramError("This is not a valid BAQ project.");
        }

        console.clear();
        console.log(
          iteration === 0
            ? "Restoring..."
            : "Project file changed. Restoring..."
        );

        const profileFile = await tryFindProfileFile(path.resolve("."));
        await restoreProject(projectFile, profileFile);

        // Watch project file.
        const abortController = new AbortController();
        const signal = abortController.signal;
        fs.watch(projectFile.path, {signal})
          [Symbol.asyncIterator]()
          .next()
          .then(() => abortController.abort());

        console.clear();
        console.log("Listening for file changes...");

        // Watch each local file.
        await Promise.all([
          ...Object.entries(projectFile.project.recordTypes).map(
            ([name, t]) => {
              if (!("path" in t)) {
                return Promise.resolve();
              }

              return watchLocalFile(projectFile, profileFile, name, t, signal);
            }
          ),
          Async.wait(signal),
        ]);

        iteration++;
      }
    },
    "Something went wrong while watching."
  );
}

async function watchLocalFile(
  projectFile: ProjectFile,
  profileFile: ProfileFile | undefined,
  name: string,
  recordType: LocalProjectRecordType,
  signal: AbortSignal
) {
  const filePath = path.join(projectFile.path, recordType.path);
  const watcher = fs.watch(filePath, {signal});

  try {
    for await (const event of watcher) {
      if (event.eventType !== "change") {
        return;
      }

      console.clear();
      console.log("Restoring", recordType.path);

      await restoreRecordType(projectFile, profileFile, name, recordType);
    }
  } catch (err) {
    if ((err as any).name === "AbortError") {
      return;
    }

    throw err;
  }
}
