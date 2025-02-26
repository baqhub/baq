import {Column, Row} from "@baqhub/ui/core/style.jsx";
import {FC} from "react";
import tiwi from "tiwi";
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

const PostLink = tiwi(Link)`
  block
`;

const Layout = tiwi(Column)`
  group
  gap-5
  sm:gap-3
  md:gap-4
  sm:flex-row
  sm:items-center
`;

const PostImage = tiwi.div`
  relative
  sm:w-60
  md:w-72
  bg-zinc-100
  dark:bg-zinc-900

  rounded-lg
  overflow-hidden
  [&_>_img]:w-full
  sm:group-hover:[&_>_img]:scale-105
  sm:group-hover:[&_>_img]:opacity-100
  sm:[&_>_img]:transition-[scale,opacity]
  sm:[&_>_img]:duration-150
  sm:[&_>_img]:opacity-90
  dark:sm:[&_>_img]:opacity-80
  select-none
`;

const PostImageBorder = tiwi.div`
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

const Details = tiwi(Column)`
  px-2
`;

const Attributes = tiwi(Row)`
  items-center
  gap-3
`;

const Category = tiwi.div`
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

const Date = tiwi(TextSelect)`
  text-xs
  font-medium
  uppercase

  text-zinc-500
  dark:text-zinc-400
`;

const Title = tiwi(TextSelect)`
  mt-2

  text-3xl
  md:text-4xl
  font-medium
  md:font-normal
  group-hover:text-amber-600
  dark:group-hover:text-amber-400
  transition-colors
  duration-150
`;

const Subtitle = tiwi(TextSelect)`
  mt-1
  md:mt-2

  text-lg
  md:text-xl
  md:font-light
  text-zinc-500
  dark:text-zinc-400
`;

const PostAuthor = tiwi(Row)`
  mt-2
  md:mt-3
  items-center
  gap-2
`;

const AuthorImage = tiwi.div`
  relative
  w-8
  h-8
  rounded-full
  overflow-hidden
  select-none

  bg-zinc-200
  dark:bg-zinc-950
`;

const AuthorImageBorder = tiwi.div`
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

const AuthorName = tiwi(TextSelect)`
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
