import {IO, RAuthenticationState} from "@baqhub/sdk";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";

//
// Model.
//

const RProfileRaw = IO.object({
  authentication: IO.optional(RAuthenticationState),
});

export interface Profile extends IO.TypeOf<typeof RProfileRaw> {}
export const RProfile = IO.clean<Profile>(RProfileRaw);

export interface ProfileFile {
  path: string;
  profile: Profile;
}

//
// I/O.
//

function buildProfileFileDirectoryPath(basePath: string) {
  return path.join(basePath, ".baq");
}

function buildProfileFilePath(basePath: string) {
  return path.join(buildProfileFileDirectoryPath(basePath), "profile.json");
}

async function readProfileFile(
  directoryPath: string
): Promise<ProfileFile | undefined> {
  try {
    const profileFilePath = buildProfileFilePath(directoryPath);
    const profileJson = await fs.readFile(profileFilePath, {encoding: "utf-8"});

    const profileEncoded = JSON.parse(profileJson);
    const profile = IO.decode(RProfile, profileEncoded);

    return {
      path: path.resolve(directoryPath),
      profile,
    };
  } catch (err) {
    return undefined;
  }
}

async function tryFindProfileFileFromPath(
  startPath: string
): Promise<ProfileFile | undefined> {
  const profileFile = await readProfileFile(startPath);
  if (profileFile) {
    return profileFile;
  }

  const parentPath = startPath.split(path.sep).slice(0, -1).join(path.sep);
  if (!parentPath) {
    return undefined;
  }

  return tryFindProfileFileFromPath(parentPath);
}

export async function tryFindProfileFile(startPath: string) {
  return (
    (await tryFindProfileFileFromPath(startPath)) ||
    (await tryFindProfileFileFromPath(os.homedir()))
  );
}

export async function writeProfileFile({path, profile}: ProfileFile) {
  const profileEncoded = IO.encode(RProfile, profile);
  const profileJson = JSON.stringify(profileEncoded, undefined, 2);

  const profileFileDirectoryPath = buildProfileFileDirectoryPath(path);
  await fs.mkdir(profileFileDirectoryPath, {recursive: true});

  const profileFilePath = buildProfileFilePath(path);
  await fs.writeFile(profileFilePath, profileJson);
}

export async function deleteProfileFile({path}: ProfileFile) {
  const profileFilePath = buildProfileFilePath(path);
  await fs.rm(profileFilePath);
}
