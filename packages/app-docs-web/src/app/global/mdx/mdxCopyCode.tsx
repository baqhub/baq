import {FC, PropsWithChildren} from "react";
import {isServerRendering} from "../serverRender.js";
import {ClientMdxCopyCode} from "./clientMdxCopyCode.jsx";

//
// Component.
//

export const MdxCopyCode: FC<PropsWithChildren> = ({children}) => {
  if (isServerRendering()) {
    return children;
  }

  return <ClientMdxCopyCode>{children}</ClientMdxCopyCode>;
};
