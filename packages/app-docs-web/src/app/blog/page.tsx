import {Column, Row, tw} from "@baqhub/ui/core/style.jsx";
import {Metadata} from "next";
import {FC} from "react";
import IconRss from "../../docs/assets/iconRss.svg";
import {blogPosts} from "../../services/blog.js";
import {Text} from "../global/style.jsx";
import {BlogPostItem} from "./blogPostItem.jsx";

//
// Style.
//

const Layout = tw(Column)`
  self-center
  w-full
  max-w-screen-md
  min-w-0
`;

const Header = tw(Row)`
  items-center
  justify-center
  pt-14
  pb-24
  gap-3

  border-b
  border-zinc-200
  dark:border-zinc-600
`;

const HeaderTitle = tw(Text)`
  text-6xl
  font-bold
`;

const HeaderIcon = tw.div`
  w-10
  h-10
  translate-y-[1px]
`;

const Posts = tw(Column)`
  py-14
`;

//
// Component.
//

export const metadata: Metadata = {
  title: "Blog",
};

const BlogPage: FC = () => {
  const posts = blogPosts.map(post => (
    <BlogPostItem key={post.id} post={post} />
  ));

  return (
    <Layout>
      <Header>
        <HeaderTitle>Blog</HeaderTitle>
        <HeaderIcon>
          <IconRss />
        </HeaderIcon>
      </Header>
      <Posts>{posts}</Posts>
    </Layout>
  );
};

export default BlogPage;
