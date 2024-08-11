import {Row, tw} from "@baqhub/ui/core/style.jsx";
import {ArrowUpRightIcon} from "@heroicons/react/20/solid";
import {FC} from "react";
import {Link} from "../global/link.jsx";
import {Text} from "../global/style.jsx";

//
// Style.
//

const Box = tw(Row)`
  group
  py-1.5
  px-4
  items-center
  gap-1.5

  rounded-lg
  bg-zinc-200
  hover:bg-zinc-300
  dark:bg-zinc-700
  dark:hover:bg-zinc-600
  transition-colors
`;

const BoxText = tw(Text)`
  font-medium

  text-zinc-800
  dark:text-zinc-200
`;

const BoxArrow = tw.div`
  h-5
  w-5
  -mr-px

  text-zinc-800
  dark:text-zinc-200
`;

//
// Component.
//

export const HomeViewOnGithub: FC = () => {
  return (
    <Link href="https://github.com/baqhub/baq" target="_blank">
      <Box>
        <BoxText>View on GitHub</BoxText>
        <BoxArrow>
          <ArrowUpRightIcon />
        </BoxArrow>
      </Box>
    </Link>
  );
};
