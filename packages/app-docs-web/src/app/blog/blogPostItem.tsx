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
  [&_>_img]:group-hover:scale-105
  [&_>_img]:group-hover:opacity-100
  [&_>_img]:transition-[transform,opacity]
  [&_>_img]:duration-150
  [&_>_img]:opacity-90
  dark:[&_>_img]:opacity-80
  select-none
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
  pointer-events-none
`;

const Details = tw(Column)`
  pl-6
  pr-10
`;

const Attributes = tw(Row)`
  items-center
  gap-3
`;

const Category = tw.div`
  text-xs
  leading-3
  font-medium
  uppercase

  px-0.5
  pt-px

  rounded
  border
  border-amber-500/40
  bg-amber-500/20

  text-amber-600
  dark:text-amber-400
`;

const Date = tw(TextSelect)`
  text-xs
  font-medium
  uppercase

  text-zinc-500
  dark:text-zinc-400
`;

const Title = tw(TextSelect)`
  mt-2

  text-4xl
  group-hover:text-amber-600
  dark:group-hover:text-amber-400
  transition-colors
  duration-150
`;

const Subtitle = tw(TextSelect)`
  mt-3

  text-xl
  font-light
  text-zinc-500
  dark:text-zinc-400
`;

const PostAuthor = tw(Row)`
  mt-4
  items-center
  gap-2
`;

const AuthorImage = tw.div`
  relative
  w-8
  h-8
  rounded-full
  overflow-hidden
  select-none
`;

const AuthorImageBorder = tw.div`
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
  pointer-events-none
`;

const AuthorName = tw(TextSelect)`
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
        <Details>
          <Attributes>
            <Category>news</Category>
            <Date>{dateToString(post.date)}</Date>
          </Attributes>
          <Title>{post.title}</Title>
          <Subtitle>{post.subTitle}</Subtitle>
          <PostAuthor>
            <AuthorImage>
              <Image {...authorImage} alt={post.author.name} />
              <AuthorImageBorder />
            </AuthorImage>
            <AuthorName>{post.author.name}</AuthorName>
          </PostAuthor>
        </Details>
      </Layout>
    </PostLink>
  );
};
