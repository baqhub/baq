function randomStringOfLength(length: number) {
  function toHex(num: number) {
    return num.toString(16).padStart(2, "0");
  }

  const array = new Uint8Array(Math.ceil(length / 2));
  crypto.getRandomValues(array);
  return Array.from(array, toHex).join("").substring(0, length);
}

function buildQueryString(params: ReadonlyArray<readonly [string, string]>) {
  const queryString = params
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");

  return queryString && "?" + queryString;
}

//
// Base64.
//

function base64UrlEncode(source: string) {
  return btoa(source)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function base64UrlDecode(source: string) {
  const unescaped = source
    .replaceAll("_", "/")
    .replaceAll("-", "+")
    .padEnd(source.length + ((4 - (source.length % 4)) % 4), "=");

  return atob(unescaped);
}

//
// Unicode.
//

function unicodeLength(source: string) {
  let length = 0;

  for (const _ of source) {
    length++;
  }

  return length;
}

function unicodeIndex(source: string, index: number) {
  let resultIndex = 0;

  for (let i = 0; i < index; i++) {
    resultIndex++;

    const code = source.charCodeAt(i);

    // If this code unit is in high-surrogate,
    // don't count the next one.
    if (0xd800 <= code && code <= 0xdbff) {
      i++;
    }
  }

  return resultIndex;
}

function jsLength(source: string, length: number) {
  let resultLength = 0;

  for (let i = 0; i < length; i++) {
    resultLength++;

    const code = source.charCodeAt(i);

    // If this code unit is in high-surrogate,
    // it counts twice.
    if (0xd800 <= code && code <= 0xdbff) {
      resultLength++;
    }
  }

  return resultLength;
}

export const Str = {
  random: randomStringOfLength,
  toUrlBase64: base64UrlEncode,
  fromUrlBase64: base64UrlDecode,
  query: buildQueryString,
  unicodeLength,
  unicodeIndex,
  jsLength,
};
