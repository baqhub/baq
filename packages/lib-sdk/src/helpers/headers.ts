const linkHeaderRegexp = /<([^>]+)>;\srel="([^"]+)"/g;

export function findLink(headers: Headers, rel: string) {
  const linkHeader = headers.get("Link");
  if (!linkHeader) {
    return undefined;
  }

  const firstLink = [...linkHeader.matchAll(linkHeaderRegexp)]
    .map(g => [g[1], g[2]] as [string, string])
    .filter(([, r]) => r === rel)
    .map(([link]) => link)
    .at(0);

  return firstLink;
}
