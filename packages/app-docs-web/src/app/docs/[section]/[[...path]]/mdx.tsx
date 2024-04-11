import {tw} from "@baqhub/ui/core/style.js";

export const MdxH1 = tw.h1`
  mb-6
  lg:scroll-mt-28

  text-4xl
  font-semibold
  text-zinc-900
  dark:text-white
`;

export const MdxH2 = tw.h2`
  mt-8
  mb-5
  pt-6
  [&_+_*]:mt-0

  // Account for difference in top-bar.
  scroll-mt-10
  lg:scroll-mt-14

  border-t
  border-zinc-200
  dark:border-zinc-700

  text-3xl
  font-semibold
  text-zinc-900
  dark:text-white
`;

export const MdxH3 = tw.h3`
  mt-8
  mb-4
  pt-6
  [&_+_*]:mt-0

  // Account for difference in top-bar.
  scroll-mt-14
  lg:scroll-mt-14

  border-t
  border-zinc-200
  dark:border-zinc-700

  [h2_+_&]:pt-0
  [h2_+_&]:border-t-0
  [h2_+_&]:lg:scroll-mt-20

  text-2xl
  font-semibold
  text-zinc-900
  dark:text-white
`;

export const MdxH4 = tw.h4`
  mt-6
  mb-3.5
  [&_+_*]:mt-0

  text-lg
  font-semibold
  text-zinc-900
  dark:text-white
`;

export const MdxP = tw.p`
  mt-3
  mb-3

  text-zinc-600
  dark:text-zinc-300
  leading-[1.75]
  font-normal
`;

export const MdxCompactList = tw.div`
  [&_li]:mt-1
  [&_li]:mb-1

  [&_li_li]:mt-1
  [&_li_li]:mb-1
  [&_li_>_p]:mt-1
  [&_li_>_p]:mb-1
  [&_li_>_&_>_p]:mt-1
  [&_li_>_&_>_p]:mb-1
`;

export const MdxUl = tw.ul`
  mt-5
  mb-5
  pl-6
  [ul_&]:mt-3
  [ul_&]:mb-3

  list-disc
  marker:text-zinc-600
  dark:marker:text-zinc-300
`;

export const MdxOl = tw.ol`
  mt-5
  mb-5
  pl-6
  [ol_&]:mt-3
  [ol_&]:mb-3

  list-decimal
  marker:italic
  marker:text-zinc-500
  dark:marker:text-zinc-400
`;

export const MdxLi = tw.li`
  mt-3
  mb-3
  [&_li]:mt-1.5
  [&_li]:mb-1.5
  [&_>_p]:mt-3
  [&_>_p]:mb-3
  [&_>_&_>_p]:mt-2
  [&_>_&_>_p]:mb-2

  leading-[1.75]
  text-zinc-600
  dark:text-zinc-300
`;

export const MdxProperties = tw.div`
  [&_>_ul]:list-none
  [&_>_ul]:pl-0
  [&_>_ul_>_li_>_ul]:list-none
  [&_>_ul_>_li]:mb-6
  [&_>_ul_p]:mt-1.5
  [&_>_ul_p]:mb-1.5
`;

export const MdxA = tw.a`
  text-amber-700
  dark:text-amber-500
  underline
  underline-offset-2

  decoration-amber-700/0
  hover:decoration-amber-700
  dark:decoration-amber-500/0
  dark:hover:decoration-amber-500

  cursor-pointer
  transition-colors
  duration-100
`;

export const MdxStrong = tw.strong`
  text-zinc-800
  dark:text-zinc-100
  font-semibold
`;

export const MdxPre = tw.pre`
  flex
  flex-row

  [&_>_code]:grow
  [&_>_code]:flex
  [&_>_code]:flex-col
  [&_>_code]:justify-stretch

  mt-3
  mb-5

  py-4
  -mx-6
  sm:mx-0
  sm:rounded-lg

  overflow-y-auto

  bg-zinc-800
  dark:bg-zinc-900
`;

export const MdxCode = tw.code`
  px-1
  py-0.5

  rounded-md
  bg-zinc-100
  dark:bg-zinc-900

  align-middle
  break-words
  text-sm
  text-inherit
  ligatures-none

  [h3_&]:bg-transparent
  dark:[h3_&]:bg-transparent
  [h3_&]:px-0
  [h3_&]:py-0
  [h3_&]:text-2xl

  [pre_&]:p-0
  [pre_&]:rounded-none
  [pre_&]:bg-transparent
  dark:[pre_&]:bg-transparent
  [pre_&]:text-zinc-200
  dark:[pre_&]:text-zinc-200
`;
