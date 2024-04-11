function parseFileName(fileName: string) {
  const fileNameRegexp = /^(.+?)(\.[^.]+)?$/;
  const [, name, extension] = fileName.match(fileNameRegexp) || ["", "", ""];
  return [name, extension];
}

const allowedCharacter = "a-zA-Z0-9. ()[\\]{}()_-";
const disallowedCharacterRegexp = new RegExp(`[^${allowedCharacter}]`, "g");
const validFileNameRegexp = new RegExp(`^(?!([.]+$))[${allowedCharacter}]+$`);

function isValidFileName(fileName: string) {
  return Boolean(fileName.match(validFileNameRegexp));
}

function normalizeFileName(fileName: string) {
  const normalizedFileName = fileName
    .replaceAll(disallowedCharacterRegexp, "")
    .trim();

  if (!isValidFileName(normalizedFileName)) {
    return null;
  }

  return normalizedFileName;
}

export const FileName = {
  parse: parseFileName,
  isValid: isValidFileName,
  normalize: normalizeFileName,
};
