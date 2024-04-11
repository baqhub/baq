import {FC, PropsWithChildren} from "react";
import {Grid, tw} from "../../core/style.js";

//
// Style.
//

const Layout = tw(Grid)`
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
