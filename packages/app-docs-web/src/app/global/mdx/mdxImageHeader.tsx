import {FC, PropsWithChildren, ReactNode} from "react";
import {onlyText} from "react-children-utilities";
import tiwi from "tiwi";
import {slugify} from "../../../helpers/stringHelpers.js";

//
// Props.
//

interface ImageHeaderProps extends PropsWithChildren {
  icon: ReactNode;
}

//
// Style.
//

const Layout = tiwi.div`
  mb-5
  mt-12
  flex
  scroll-mt-10

  flex-row
  items-center
  gap-2.5
  border-t

  border-zinc-200
  pt-6

  text-3xl
  font-semibold
  text-zinc-900

  lg:scroll-mt-14
  dark:border-zinc-700
  dark:text-white
  [&_+_*]:mt-0
`;

//
// Component.
//

export const ImageHeader: FC<ImageHeaderProps> = ({icon, children}) => (
  <Layout>
    <div className="w-8 text-amber-500">{icon}</div>
    <h2
      id={slugify(onlyText(children))}
      className="scroll-mt-24 lg:scroll-mt-28"
    >
      {children}
    </h2>
  </Layout>
);
