import {MDXComponents} from "mdx/types.js";
import * as path from "node:path";
import {FC} from "react";
import {listAndMap} from "../helpers/fileHelpers.js";
import {slugify} from "../helpers/stringHelpers.js";

//
// Model.
//

interface BlogPostAuthor {
  name: string;
  role: string;
  image: string;
}

const authors: Record<string, BlogPostAuthor> = {
  quentez: {
    name: "Quentin Calvez",
    role: "Founder",
    image: "authorQuentez",
  },
};

interface BlogPostProps {
  components?: MDXComponents;
}

interface BlogPostMetadata {
  id: string;
  authorId: string;
  date: string;
  title: string;
  subTitle: string;
  image: string;
}

export interface BlogPost {
  path: string;
  id: string;
  author: BlogPostAuthor;
  date: Date;
  title: string;
  subTitle: string;
  image: string;
  Component: FC<BlogPostProps>;
}

//
// Posts.
//

function dateToSlug(date: Date) {
  return date.toISOString().slice(0, 10);
}

function loadBlogPosts() {
  const blogPath = path.resolve(process.cwd(), "src", "docs", "blog");
  return listAndMap(blogPath, async (i): Promise<BlogPost | undefined> => {
    if (!i.isFile() || !i.name.endsWith(".mdx")) {
      return undefined;
    }

    const page = i.name.slice(0, -4);
    const mdxPath = `blog/${page}`;
    const imported = await import(`../docs/${mdxPath}.mdx`);
    if (!imported) {
      return undefined;
    }

    const Component: FC<BlogPostProps> = imported.default;
    const metadata: BlogPostMetadata = imported.metadata;

    const date = new Date(metadata.date);
    const author = authors[metadata.authorId];
    if (!author) {
      throw new Error("Author not found.");
    }

    return {
      path: `${dateToSlug(date)}/${slugify(metadata.title)}`,
      id: metadata.id,
      author,
      date,
      title: metadata.title,
      subTitle: metadata.subTitle,
      image: metadata.image,
      Component,
    };
  });
}

export const blogPosts = (await loadBlogPosts()).toSorted(
  p => -p.date.getTime()
);

export function findBlogPostById(id: string) {
  return blogPosts.find(p => p.id === id);
}
