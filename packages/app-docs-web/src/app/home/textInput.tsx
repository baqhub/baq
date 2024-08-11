import {tw} from "@baqhub/ui/core/style.jsx";
import {FC} from "react";

//
// Style.
//

const Input = tw.input`
  block

  py-1.5
  px-4

  text-zinc-800
  dark:text-zinc-200

  rounded-lg
  bg-zinc-200
  hover:bg-zinc-300
  dark:bg-zinc-900
  dark:hover:bg-zinc-950
`;

//
// Component.
//

export const HomeSubscribeForm: FC = () => {
  return (
    <form>
      <Input name="email" placeholder="email@host.com" />
    </form>
  );
};
