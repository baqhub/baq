import {Row} from "@baqhub/ui/core/style.jsx";
import {FC} from "react";
import tiwi from "tiwi";
import LogoSmall from "../../../../docs/assets/logoSmall.svg";
import {SvgUniqueIds} from "../../../../helpers/svgUniqueIds.jsx";
import {DocsSubSectionLight} from "../../../../services/docs.js";
import {Link} from "../../../global/link.jsx";
import {DocsLeftNavMenu} from "./docsLeftNavMenu.jsx";

//
// Props.
//

interface DocsLeftNavProps {
  section: string;
  subSections: ReadonlyArray<DocsSubSectionLight>;
}

//
// Style.
//

const Layout = tiwi.div`
  hidden
  lg:block

  relative
  z-10
  shrink-0
  w-64
`;

const Background = tiwi.div`
  fixed
  -top-[10000px]
  -bottom-[10000px]
  -ml-[10000px]
  w-[calc(10000px_+_16rem)]

  bg-zinc-100
  dark:bg-zinc-900
`;

const Content = tiwi.div`
  fixed
  top-0
  bottom-0

  flex
  flex-col
  w-64
`;

const Top = tiwi.div`
  mx-8

  border-b
  border-zinc-200
  dark:border-zinc-700
`;

const TopContent = tiwi(Row)`
  h-16
  items-center
`;

const TitleLink = tiwi(Link)`
  py-1

  text-zinc-900
  hover:text-amber-700
  dark:text-white
  dark:hover:text-amber-400
`;

const TitleLogo = tiwi(LogoSmall)`
  h-8
`;

const Menu = tiwi.div`
  grow
  pb-8
  overflow-y-auto
`;

//
// Component.
//

export const DocsLeftNav: FC<DocsLeftNavProps> = props => {
  const {section, subSections} = props;
  return (
    <Layout>
      <Background />
      <Content>
        <Top>
          <TopContent>
            <TitleLink href="/">
              <SvgUniqueIds>
                <TitleLogo />
              </SvgUniqueIds>
            </TitleLink>
          </TopContent>
        </Top>
        <Menu>
          <DocsLeftNavMenu section={section} subSections={subSections} />
        </Menu>
      </Content>
    </Layout>
  );
};
