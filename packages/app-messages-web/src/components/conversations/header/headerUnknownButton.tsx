import {Handler} from "@baqhub/sdk";
import {DataProvider} from "@baqhub/sdk-react";
import {IconButton} from "@baqhub/ui/core/iconButton.js";
import {UserIcon} from "@heroicons/react/20/solid";
import {FC} from "react";
import tiwi from "tiwi";

//
// Props.
//

interface HeaderUnknownButtonProps {
  getCount: DataProvider<number>;
  onClick: Handler;
}

//
// Style.
//

const Layout = tiwi.div`
  relative
`;

const Counter = tiwi.div`
  absolute
  -right-1
  -bottom-1

  min-w-4
  px-1

  rounded-full
  bg-neutral-200

  text-xs
  text-neutral-900
  text-center

  pointer-events-none
`;

//
// Component.
//

export const HeaderUnknownButton: FC<HeaderUnknownButtonProps> = props => {
  const {getCount, onClick} = props;
  const count = getCount();

  if (count === 0) {
    return null;
  }

  const countText = count > 9 ? "9+" : count.toString();
  return (
    <Layout>
      <IconButton onClick={onClick}>
        <UserIcon />
      </IconButton>
      <Counter>{countText}</Counter>
    </Layout>
  );
};
