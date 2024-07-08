const parseHeaderRegexp = /(?:^|\s+)([\w]+)="([^"]+)"/g;

function parseHeader(value: string) {
  return [...value.matchAll(parseHeaderRegexp)].reduce(
    (result, match) => {
      if (!match || !match[1] || !match[2]) {
        return result;
      }

      result[match[1]] = match[2];
      return result;
    },
    {} as Record<string, string>
  );
}

function headerToString(value: object) {
  return Object.entries(value)
    .map(([k, v]) => `${k}="${v}"`)
    .join(" ");
}

export const HttpHeader = {
  parse: parseHeader,
  toString: headerToString,
};
