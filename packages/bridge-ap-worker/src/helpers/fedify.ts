import {fetchDocumentLoader} from "@fedify/fedify";

export function patchedDocumentLoader(url: string) {
  return fetchDocumentLoader(url, true);
}
