import {Column, tw} from "@baqhub/ui/core/style.jsx";
import {Metadata} from "next";
import {FC} from "react";
import {blogPosts, findBlogPost} from "../../../services/blog.js";

//
// Props.
//

interface BlogPostPageParams {
  path: ReadonlyArray<string>;
}

interface BlogPostPageProps {
  params: BlogPostPageParams;
}

//
// Data.
//

export async function generateStaticParams(): Promise<BlogPostPageParams[]> {
  return blogPosts.map(p => ({
    path: p.path.split("/"),
  }));
}

//
// Style.
//

const Layout = tw(Column)`
  self-center
  w-full
  max-w-screen-md
  min-w-0
`;

const PostContent = tw.div`
  min-w-0
`;

//
// Component.
//

export function generateMetadata({
  params: {path},
}: BlogPostPageProps): Metadata {
  const post = findBlogPost(path?.join("/"));
  return {title: `${post.title} | Blog`};
}

const BlogPostPage: FC<BlogPostPageProps> = () => {
  return (
    <Layout>
      <PostContent></PostContent>
    </Layout>
  );
};

export default BlogPostPage;
