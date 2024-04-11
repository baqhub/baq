import flatten from "lodash/flatten.js";
import isObject from "lodash/isObject.js";
import {Dirent} from "node:fs";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import {FC} from "react";
import {MDXProps, Metadata} from "../docs/any.mdx";
import {slugify} from "../helpers/string.js";

//
// Model.
//

type DocsPageData = [FC<MDXProps>, Metadata];
type DocsTopPageData = [FC<MDXProps>, Metadata, ReadonlyArray<DocsPageData>];
type DocsSubSectionData = [string, ReadonlyArray<DocsTopPageData>];
type DocsSectionData = [string, ReadonlyArray<DocsSubSectionData>];

//
// Data.
//

async function listAndMap<T>(
  path: string,
  mapper: (i: Dirent) => Promise<T | undefined>
) {
  try {
    const items = await fs.readdir(path, {withFileTypes: true});
    const tasks = items.map(mapper);
    const results = await Promise.all(tasks);
    return results.filter(isDefined);
  } catch (err) {
    if (isObject(err) && "code" in err && err.code === "ENOENT") {
      return [];
    }

    throw err;
  }
}

const docs = await loadDocs();

function loadDocs() {
  const docsPath = path.resolve(process.cwd(), "src", "docs");
  return listAndMap(docsPath, async i => {
    if (!i.isDirectory() || i.name === "assets") {
      return undefined;
    }

    const section = i.name;
    const sectionPath = path.join(i.path, i.name);
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

    const metadata: Metadata = imported.metadata;

    const subSectionPath = path.join(i.path, subSection);
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

    const Component: FC<MDXProps> = imported.default;
    const metadata: Metadata = imported.metadata;

    const topPagePath = path.join(i.path, topPage);
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

    const Component: FC<MDXProps> = imported.default;
    const metadata: Metadata = imported.metadata;

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
  path: string;
  id: string;
  title: string;
  summary: string | undefined;
  subPages: ReadonlyArray<DocsPageFull>;
  Component: FC<MDXProps>;
}

function docsPageToFull(
  parentPath: string,
  section: string,
  [Component, metadata, subPages]: DocsTopPageData | DocsPageData
): DocsPageFull {
  const path = `${parentPath}/${slugify(metadata.title)}`;
  return {
    section,
    path,
    id: metadata.id,
    title: metadata.title,
    summary: metadata.summary,
    subPages: (subPages || []).map(sp => docsPageToFull(path, section, sp)),
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
            const topPageFull = docsPageToFull(path, section, topPage);
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
    subSection,
    pages: pages.map(p => docsPageToLight(path, p)),
  };
}

export async function listSubSectionsForSection(section: string) {
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
    throw new Error("Page not found.");
  }

  return page;
}

export function findDocsPageById(id: string) {
  const page = docsPages.find(p => p.id === id);

  if (!page) {
    throw new Error("Page not found: " + id);
  }

  return page;
}

function isDefined<T>(value: T | undefined): value is T {
  return typeof value !== "undefined";
}
