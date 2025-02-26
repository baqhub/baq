import {FC, PropsWithChildren} from "react";
import tiwi from "tiwi";
import {Column} from "../../core/style.js";

//
// Style.
//

const Layout = tiwi(Column)`
  max-h-full
  p-6

  rounded-xl
  shadow-lg

  bg-white
  dark:bg-neutral-900
`;

//
// Component.
//

export const DialogContent: FC<PropsWithChildren> = ({children}) => {
  return <Layout>{children}</Layout>;
};
