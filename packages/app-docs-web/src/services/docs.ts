import flatten from "lodash/flatten.js";
import {MDXComponents} from "mdx/types.js";
import * as path from "node:path";
import {ComponentType, FC, ReactNode} from "react";
import {listAndMap} from "../helpers/fileHelpers.js";
import {slugify} from "../helpers/stringHelpers.js";

//
// Model.
//

interface DocPageProps {
  toc?: ReactNode;
  pages?: ReactNode;
  properties: ComponentType;
  code: ComponentType;
  pill: ComponentType;
  compactList: ComponentType;
  components?: MDXComponents;
}

interface DocPageMetadata {
  id: string;
  title: string;
  summary?: string;
}

type DocsPageData = [FC<DocPageProps>, DocPageMetadata];
type DocsTopPageData = [
  FC<DocPageProps>,
  DocPageMetadata,
  ReadonlyArray<DocsPageData>,
];
type DocsSubSectionData = [string, ReadonlyArray<DocsTopPageData>];
type DocsSectionData = [string, ReadonlyArray<DocsSubSectionData>];

//
// Data.
//

const docs = await loadDocs();

function loadDocs() {
  const docsPath = path.resolve(process.cwd(), "src", "docs");
  return listAndMap(docsPath, async i => {
    if (!i.isDirectory() || !["learn", "reference"].includes(i.name)) {
      return undefined;
    }

    const section = i.name;
    const sectionPath = path.join(i.parentPath, i.name);
    const subSections = await loadSubSectionsAt(section, sectionPath);

    const result: DocsSectionData = [section, subSections];
    return result;
  });
}

function loadSubSectionsAt(section: string, sectionPath: string) {
  return listAndMap(sectionPath, async i => {
    if (!i.isFile() || !i.name.endsWith(".mdx")) {
      return undefined;
    }

    const subSection = i.name.slice(0, -4);
    const mdxPath = `${section}/${subSection}`;
    const imported = await import(`../docs/${mdxPath}.mdx`);
    if (!imported) {
      return undefined;
    }

    const metadata: DocPageMetadata = imported.metadata;

    const subSectionPath = path.join(i.parentPath, subSection);
    const topPages = await loadTopPagesAt(mdxPath, subSectionPath);

    const result: DocsSubSectionData = [metadata.title, topPages];
    return result;
  });
}

function loadTopPagesAt(importPath: string, subSectionPath: string) {
  return listAndMap(subSectionPath, async i => {
    if (!i.isFile() || !i.name.endsWith(".mdx")) {
      return undefined;
    }

    const topPage = i.name.slice(0, -4);
    const mdxPath = `${importPath}/${topPage}`;
    const imported = await import(`../docs/${mdxPath}.mdx`);
    if (!imported) {
      return undefined;
    }

    const Component: FC<DocPageProps> = imported.default;
    const metadata: DocPageMetadata = imported.metadata;

    const topPagePath = path.join(i.parentPath, topPage);
    const pages = await loadPagesAt(mdxPath, topPagePath);

    const result: DocsTopPageData = [Component, metadata, pages];
    return result;
  });
}

function loadPagesAt(importPath: string, topPagePath: string) {
  return listAndMap(topPagePath, async i => {
    if (!i.isFile() || !i.name.endsWith(".mdx")) {
      return undefined;
    }

    const page = i.name.slice(0, -4);
    const mdxPath = `${importPath}/${page}`;
    const imported = await import(`../docs/${mdxPath}.mdx`);
    if (!imported) {
      return undefined;
    }

    const Component: FC<DocPageProps> = imported.default;
    const metadata: DocPageMetadata = imported.metadata;

    const result: DocsPageData = [Component, metadata];
    return result;
  });
}

//
// Sections.
//

export const docsSections = docs.map(([section]) => section);

//
// All pages.
//

export interface DocsPageFull {
  section: string;
  subSection: string;
  path: string;
  id: string;
  title: string;
  summary: string | undefined;
  subPages: ReadonlyArray<DocsPageFull>;
  Component: FC<DocPageProps>;
}

function docsPageToFull(
  parentPath: string,
  section: string,
  subSection: string,
  [Component, metadata, subPages]: DocsTopPageData | DocsPageData
): DocsPageFull {
  const path = `${parentPath}/${slugify(metadata.title)}`;
  return {
    section,
    subSection,
    path,
    id: metadata.id,
    title: metadata.title,
    summary: metadata.summary,
    subPages: (subPages || []).map(sp =>
      docsPageToFull(path, section, subSection, sp)
    ),
    Component,
  };
}

export const docsPages = flatten(
  docs.map(([section, subSections]) =>
    flatten(
      subSections.map(([subSection, topPages]) => {
        const path = slugify(subSection);
        return flatten(
          topPages.map(topPage => {
            const topPageFull = docsPageToFull(
              path,
              section,
              subSection,
              topPage
            );
            return [topPageFull, ...topPageFull.subPages];
          })
        );
      })
    )
  )
);

//
// Single section.
//

export interface DocsPageLight {
  path: string;
  title: string;
  summary: string | undefined;
  subPages: ReadonlyArray<DocsPageLight>;
}

export interface DocsSubSectionLight {
  path: string;
  subSection: string;
  pages: ReadonlyArray<DocsPageLight>;
}

function docsPageToLight(
  parentPath: string,
  [, metadata, pages]: DocsTopPageData | DocsPageData
): DocsPageLight {
  const path = `${parentPath}/${slugify(metadata.title)}`;
  return {
    path,
    title: metadata.title,
    summary: metadata.summary,
    subPages: pages?.map(p => docsPageToLight(path, p)) || [],
  };
}

function subSectionToLight([
  subSection,
  pages,
]: DocsSubSectionData): DocsSubSectionLight {
  const path = slugify(subSection);
  return {
    path,
    subSection,
    pages: pages.map(p => docsPageToLight(path, p)),
  };
}

export function listSubSectionsForSection(section: string) {
  const sectionData = docs.find(([s]) => s === section);
  if (!sectionData) {
    throw new Error();
  }

  return sectionData[1].map(subSectionToLight);
}

//
// Single page.
//

export function findDocsPage(section: string, path: string | undefined) {
  const page = docsPages.find(
    p => p.section === section && (!path || p.path === path)
  );

  if (!page) {
    throw new Error("Page not found: " + path);
  }

  return page;
}

export function findDocsPageById(id: string) {
  return docsPages.find(p => p.id === id);
}
