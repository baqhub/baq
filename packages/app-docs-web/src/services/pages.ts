import {findBlogPostById} from "./blog.js";
import {findDocsPageById} from "./docs.js";

const pageIdRegexp = /^([0-9a-f]{8})(#.*)?/;

export function findPagePath(href: string) {
  const pageIdMatch = href.match(pageIdRegexp);
  if (!pageIdMatch) {
    return undefined;
  }

  const docPage = findDocsPageById(pageIdMatch[1]!);
  if (docPage) {
    const anchor = pageIdMatch[2] || "";
    return `/docs/${docPage.section}/${docPage.path}${anchor}`;
  }

  const blogPost = findBlogPostById(pageIdMatch[1]!);
  if (blogPost) {
    return `/blog/${blogPost.path}`;
  }

  throw new Error(`Page not found: ${pageIdMatch[1]}`);
}
