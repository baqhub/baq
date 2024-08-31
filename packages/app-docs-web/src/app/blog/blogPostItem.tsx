import {Column, Row, tw} from "@baqhub/ui/core/style.jsx";
import {FC} from "react";
import {getImageAsync} from "../../helpers/fileHelpers.js";
import {dateToString} from "../../helpers/stringHelpers.js";
import {BlogPost} from "../../services/blog.js";
import {Image} from "../global/image.jsx";
import {Link} from "../global/link.jsx";
import {TextSelect} from "../global/style.jsx";

//
// Props.
//

interface BlogPostItemProps {
  post: BlogPost;
}

//
// Style.
//

const PostLink = tw(Link)`
  block
`;

const Layout = tw(Row)`
  group
  items-center
`;

const PostImage = tw.div`
  relative
  w-80
  bg-zinc-100
  dark:bg-zinc-900

  rounded-lg
  overflow-hidden
  [&_>_img]:w-full
  [&_>_img]:opacity-80
  [&_>_img]:group-hover:scale-110
  [&_>_img]:group-hover:opacity-100
  [&_>_img]:transition-[transform,opacity]
`;

const PostImageBorder = tw.div`
  block
  absolute
  top-0
  right-0
  bottom-0
  left-0

  rounded-lg
  border
  border-white/30
  mix-blend-soft-light
`;

const PostDetails = tw(Column)`
  gap-4
  pl-6
  pr-10
`;

const PostHeader = tw(Column)`
  gap-2
`;

const PostAttributes = tw(Row)`
  gap-3
`;

const PostCategory = tw(TextSelect)`
  text-xs
  font-medium
  uppercase
  text-amber-600
  dark:text-amber-400
`;

const PostDate = tw(TextSelect)`
  text-xs
  font-medium
  uppercase
  text-zinc-500
  dark:text-zinc-400
`;

const PostTitle = tw(TextSelect)`
  text-4xl
  group-hover:text-amber-600
  dark:group-hover:text-amber-400
  transition-colors
`;

const PostSubtitle = tw(TextSelect)`
  text-xl
  font-light
  text-zinc-500
  dark:text-zinc-400
`;

const PostAuthor = tw(Row)`
  items-center
  gap-2
`;

const PostAuthorImage = tw.div`
  relative
  w-8
  h-8
  rounded-full
  overflow-hidden
`;

const PostAuthorImageBorder = tw.div`
  block
  absolute
  top-0
  right-0
  bottom-0
  left-0

  rounded-full
  border
  border-white/50
  mix-blend-soft-light
`;

const PostAuthorName = tw(TextSelect)`
  text-zinc-600
  dark:text-zinc-300
`;

//
// Component.
//

export const BlogPostItem: FC<BlogPostItemProps> = async ({post}) => {
  const postImage = await getImageAsync(post.image);
  const authorImage = await getImageAsync(post.author.image);
  const href = `/blog/${post.path}`;

  return (
    <PostLink href={href}>
      <Layout>
        <PostImage>
          <Image {...postImage} alt={post.title} />
          <PostImageBorder />
        </PostImage>
        <PostDetails>
          <PostHeader>
            <PostAttributes>
              <PostCategory>news</PostCategory>
              <PostDate>{dateToString(post.date)}</PostDate>
            </PostAttributes>
            <PostTitle>{post.title}</PostTitle>
          </PostHeader>
          <PostSubtitle>{post.subTitle}</PostSubtitle>
          <PostAuthor>
            <PostAuthorImage>
              <Image {...authorImage} alt={post.author.name} />
              <PostAuthorImageBorder />
            </PostAuthorImage>
            <PostAuthorName>{post.author.name}</PostAuthorName>
          </PostAuthor>
        </PostDetails>
      </Layout>
    </PostLink>
  );
};
