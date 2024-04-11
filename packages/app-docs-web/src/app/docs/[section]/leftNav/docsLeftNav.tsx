import {Row, tw} from "@baqhub/ui/core/style.js";
import {FC} from "react";
import {DocsSubSectionLight} from "../../../../services/docs.js";
import {Link} from "../../../global/link.jsx";
import {Text} from "../../../global/style.jsx";
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

const Layout = tw.div`
  hidden
  lg:block

  relative
  z-10
  shrink-0
  w-64
`;

const Background = tw.div`
  fixed
  -top-[10000px]
  -bottom-[10000px]
  -ml-[10000px]
  w-[calc(10000px_+_16rem)]

  bg-zinc-100
  dark:bg-zinc-900
`;

const Content = tw.div`
  fixed
  top-0
  bottom-0

  flex
  flex-col
  w-64
`;

const Top = tw.div`
  mx-8

  border-b
  border-zinc-200
  dark:border-zinc-700
`;

const TopContent = tw(Row)`
  h-16
  items-center
`;

const TitleLink = tw(Link)`
  py-1
`;

const TitleText = tw(Text)`
  text-lg
  font-semibold
`;

const Menu = tw.div`
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
              <TitleText>BAQ</TitleText>
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
