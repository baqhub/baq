import {Row} from "@baqhub/ui/core/style.jsx";
import {FC} from "react";
import tiwi from "tiwi";
import {Link} from "../global/link.jsx";
import {Text} from "../global/style.jsx";

//
// Style.
//

const Box = tiwi(Row)`
  group
  py-1.5
  px-4
  items-center
  gap-1.5

  rounded-lg
  bg-amber-500
  hover:bg-amber-600
  dark:bg-amber-500
  dark:hover:bg-amber-400
`;

const BoxText = tiwi(Text)`
  font-medium

  text-white
  dark:text-zinc-800
`;

//
// Component.
//

export const HomeGetStarted: FC = () => {
  return (
    <Link href="/docs/learn">
      <Box>
        <BoxText>Get started</BoxText>
      </Box>
    </Link>
  );
};
