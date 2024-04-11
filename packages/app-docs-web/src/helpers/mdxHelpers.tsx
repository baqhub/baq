import render from "dom-serializer";
import {findAll} from "domutils";
import {parseDocument} from "htmlparser2";
import {ReactElement} from "react";
import {serverRender} from "../app/global/serverRender.js";

export interface MdxHeader {
  slug: string;
  content: string;
  subHeaders: ReadonlyArray<MdxHeader>;
}

const headerNodeNames = ["h2", "h3"];

export function findHeaders(content: ReactElement) {
  const contentHtml = serverRender(content as any);
  const contentDom = parseDocument(contentHtml);

  // Find all the headers.
  const headers = findAll(
    node => headerNodeNames.includes(node.name),
    contentDom.childNodes
  );

  // Convert it from a flat list to a hierarchy.
  return headers.reduce((result, node) => {
    const header: MdxHeader = {
      slug: node.attribs.id || "",
      content: render(node.children),
      subHeaders: [],
    };

    // Add H2 to the top-level list.
    if (node.name === "h2") {
      return [...result, header];
    }

    // Add H3 as sub-headers of the last H2.
    const lastH2 = result[result.length - 1];
    if (node.name === "h3" && lastH2) {
      const newLastH2 = {
        ...lastH2,
        subHeaders: [...lastH2.subHeaders, header],
      };

      return [...result.slice(0, -1), newLastH2];
    }

    return result;
  }, [] as ReadonlyArray<MdxHeader>);
}
