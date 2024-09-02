import {Column, Row, tw} from "@baqhub/ui/core/style.jsx";
import {FC} from "react";
import {getImageAsync} from "../../../helpers/fileHelpers.js";
import {dateToString} from "../../../helpers/stringHelpers.js";
import {BlogPostAuthor} from "../../../services/blog.js";
import {Image} from "../../global/image.jsx";
import {Text, TextSelect} from "../../global/style.jsx";

//
// Props.
//

interface BlogPostHeaderProps {
  date: Date;
  title: string;
  subTitle: string;
  image: string;
  author: BlogPostAuthor;
}

//
// Style.
//

const Layout = tw(Column)`
  pt-8
  sm:pt-12
`;

const Details = tw(Column)`
  px-6
  sm:px-8
  md:px-0
`;

const Attributes = tw(Row)`
  items-center
  gap-3
`;

const Category = tw(Text)`
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
  text-sm
  uppercase

  text-zinc-500
  dark:text-zinc-400
`;

const Title = tw(TextSelect)`
  mt-3
  sm:mt-4
  text-3xl
  sm:text-5xl
  font-medium
  sm:font-normal
`;

const SubTitle = tw(TextSelect)`
  mt-2
  sm:mt-4
  text-lg
  sm:text-2xl
  sm:font-light

  text-zinc-500
  dark:text-zinc-400
`;

const Author = tw(Row)`
  mt-[10px]
  sm:mt-[18px]
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

const PostImage = tw.div`
  mt-8
  sm:mt-12
  sm:mx-8
  md:mx-0

  relative
  bg-zinc-100
  dark:bg-zinc-900

  sm:rounded-lg
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
  hidden
  sm:block

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

//
// Component.
//

export const BlogPostHeader: FC<BlogPostHeaderProps> = async props => {
  const {date, title, subTitle, image, author} = props;
  const postImage = await getImageAsync(image + "Big");
  const authorImage = await getImageAsync(author.image);

  return (
    <Layout>
      <Details>
        <Attributes>
          <Category>news</Category>
          <Date>{dateToString(date)}</Date>
        </Attributes>
        <Title>{title}</Title>
        <SubTitle>{subTitle}</SubTitle>
        <Author>
          <AuthorImage>
            <Image {...authorImage} alt={author.name} />
            <AuthorImageBorder />
          </AuthorImage>
          <AuthorName>{author.name}</AuthorName>
        </Author>
      </Details>
      {/* <Separator /> */}
      <PostImage>
        <Image {...postImage} alt={title} />
        <PostImageBorder />
      </PostImage>
    </Layout>
  );
};
