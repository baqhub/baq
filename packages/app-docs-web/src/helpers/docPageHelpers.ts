const docPageRegexp = /^([0-9a-f]{8})(#.*)?/;

export function matchDocPageHref(href: string) {
  return href.match(docPageRegexp);
}
