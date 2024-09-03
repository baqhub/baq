import {Column, tw} from "@baqhub/ui/core/style.jsx";
import {MDXComponents} from "mdx/types.js";
import {Metadata} from "next";
import {ImageProps} from "next/image.js";
import {FC} from "react";
import {blogPosts, findBlogPost} from "../../../services/blog.js";
import {Footer} from "../../global/footer.jsx";
import {
  MdxCode,
  MdxCompactList,
  MdxH4,
  MdxLi,
  MdxOl,
  MdxP,
  MdxPre,
  MdxStrong,
  MdxUl,
} from "../../global/mdx/mdx.jsx";
import {MdxImage} from "../../global/mdx/mdxImage.jsx";
import {MdxLink} from "../../global/mdx/mdxLink.jsx";
import {Newsletter} from "../../global/newsletter.jsx";
import {BlogPostHeader} from "./blogPostHeader.jsx";

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
  max-w-screen-sm
  min-w-0
`;

const PostContent = tw.div`
  min-w-0
  pt-2
  sm:pt-9
  px-6
  sm:px-8
  md:px-0
`;

const NewsletterLayout = tw(Column)`
  mt-9
  px-6
  sm:px-8
  md:px-0

  sm:items-center
`;

const FooterLayout = tw(Column)`
  mt-12
  px-6
  sm:px-8
  md:px-0
`;

const components: MDXComponents = {
  h1: () => null,
  h2: ({children}) => <MdxH4>{children}</MdxH4>,
  p: ({children}) => <MdxP>{children}</MdxP>,
  ul: ({children}) => (
    <MdxCompactList>
      <MdxUl>{children}</MdxUl>
    </MdxCompactList>
  ),
  ol: ({children}) => (
    <MdxCompactList>
      <MdxOl>{children}</MdxOl>
    </MdxCompactList>
  ),
  li: ({children}) => <MdxLi>{children}</MdxLi>,
  a: ({children, href}) => <MdxLink href={href}>{children}</MdxLink>,
  img: props => <MdxImage {...(props as ImageProps)} />,
  strong: ({children}) => <MdxStrong>{children}</MdxStrong>,
  pre: ({children}) => <MdxPre>{children}</MdxPre>,
  code: ({className, children}) => (
    <MdxCode className={className}>{children}</MdxCode>
  ),
};

//
// Component.
//

export function generateMetadata({
  params: {path},
}: BlogPostPageProps): Metadata {
  const post = findBlogPost(path?.join("/"));
  return {title: `${post.title} | Blog`};
}

const BlogPostPage: FC<BlogPostPageProps> = async ({params}) => {
  const {path} = params;
  const post = findBlogPost(path?.join("/"));

  return (
    <Layout>
      <BlogPostHeader
        date={post.date}
        title={post.title}
        subTitle={post.subTitle}
        image={post.image}
        author={post.author}
      />
      <PostContent>
        <post.Component components={components} />
      </PostContent>
      <NewsletterLayout>
        <Newsletter variant="wide" />
      </NewsletterLayout>
      <FooterLayout>
        <Footer />
      </FooterLayout>
    </Layout>
  );
};

export default BlogPostPage;
