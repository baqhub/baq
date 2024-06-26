import {tw} from "@baqhub/ui/core/style.jsx";
import {MDXComponents} from "mdx/types.js";
import {Metadata} from "next";
import {ImageProps} from "next/image.js";
import {FC, ReactNode} from "react";
import {onlyText} from "react-children-utilities";
import {findHeaders} from "../../../../helpers/mdxHelpers.jsx";
import {slugify} from "../../../../helpers/string.js";
import {
  docsPages,
  docsSections,
  findDocsPage,
  listSubSectionsForSection,
} from "../../../../services/docs.js";
import {DocsLeftNav} from "../leftNav/docsLeftNav.jsx";
import {DocsRightNav} from "../rightNav/docsRightNav.jsx";
import {DocsTopNav} from "../topNav/docsTopNav.jsx";
import {Footer} from "./footer.jsx";
import {
  MdxCode,
  MdxCompactList,
  MdxH1,
  MdxH2,
  MdxH3,
  MdxH4,
  MdxH5,
  MdxLi,
  MdxOl,
  MdxP,
  MdxPre,
  MdxProperties,
  MdxStrong,
  MdxUl,
} from "./mdx.jsx";
import {MdxImage} from "./mdxImage.jsx";
import {MdxLink} from "./mdxLink.jsx";
import {MdxPill} from "./mdxPill.jsx";
import {SubPages} from "./subPages.jsx";
import {Toc} from "./toc.jsx";

//
// Props.
//

interface DocsPageParams {
  section: string;
  path?: ReadonlyArray<string>;
}

interface DocsPageProps {
  params: DocsPageParams;
}

//
// Data.
//

export async function generateStaticParams(): Promise<DocsPageParams[]> {
  const sectionPages = docsSections.map(section => ({section, path: []}));
  const pages = docsPages.map(p => ({
    section: p.section,
    path: p.path.split("/"),
  }));

  return [...sectionPages, ...pages];
}

//
// Style.
//

const Docs = tw.div`
  self-center
  w-full
  max-w-screen-2xl
  min-w-0

  flex
  flex-row
`;

const DocsCenter = tw.div`
  grow
  shrink
  min-w-0
  relative

  flex
  flex-row
  justify-center
`;

const DocsContent = tw.div`
  grow
  shrink
  min-w-0
  lg:max-w-3xl

  pt-4
  sm:pt-8
  px-6
  sm:px-8
  lg:px-8
  xl:px-12
`;

const DocsContentSection = tw.div`
  sm:hidden
  mb-3

  text-sm
  font-semibold
  text-amber-700
  dark:text-amber-500
`;

function headerId(children: ReactNode) {
  return slugify(onlyText(children));
}

const components: MDXComponents = {
  h1: ({children}) => <MdxH1 id="overview">{children}</MdxH1>,
  h2: ({children}) => <MdxH2 id={headerId(children)}>{children}</MdxH2>,
  h3: ({children}) => <MdxH3 id={headerId(children)}>{children}</MdxH3>,
  h4: ({children}) => <MdxH4>{children}</MdxH4>,
  h5: ({children}) => <MdxH5>{children}</MdxH5>,
  p: ({children}) => <MdxP>{children}</MdxP>,
  ul: ({children}) => <MdxUl>{children}</MdxUl>,
  ol: ({children}) => <MdxOl>{children}</MdxOl>,
  li: ({children}) => <MdxLi>{children}</MdxLi>,
  a: ({children, href}) => <MdxLink href={href}>{children}</MdxLink>,
  img: props => <MdxImage {...(props as ImageProps)} />,
  strong: ({children}) => <MdxStrong>{children}</MdxStrong>,
  pre: ({children}) => <MdxPre>{children}</MdxPre>,
  code: ({className, children}) => (
    <MdxCode className={className}>{children}</MdxCode>
  ),
};

//
// Component.
//

export async function generateMetadata({
  params,
}: DocsPageProps): Promise<Metadata> {
  const {section, path} = params;
  const page = await findDocsPage(section, path?.join("/"));
  return {title: page.title};
}

const DocsPage: FC<DocsPageProps> = async ({params}) => {
  const {section, path} = params;
  const page = await findDocsPage(section, path?.join("/"));
  const subSections = await listSubSectionsForSection(section);
  const subSection = subSections.find(s => s.path === path?.[0]);

  const headers = findHeaders(
    <page.Component
      properties={MdxProperties}
      code={MdxCode}
      pill={MdxPill}
      compactList={MdxCompactList}
      components={components}
    />
  );

  const toc = <Toc headers={headers} />;
  const subPages = <SubPages pages={page.subPages} />;

  return (
    <>
      <DocsTopNav
        section={section}
        subSections={subSections}
        headers={headers}
      />
      <Docs>
        <DocsLeftNav section={section} subSections={subSections} />
        <DocsCenter>
          <DocsContent>
            {subSection && (
              <DocsContentSection>{subSection.subSection}</DocsContentSection>
            )}
            <page.Component
              toc={toc}
              subPages={subPages}
              properties={MdxProperties}
              code={MdxCode}
              pill={MdxPill}
              compactList={MdxCompactList}
              components={components}
            />
            <Footer />
          </DocsContent>
        </DocsCenter>
        <DocsRightNav headers={headers} />
      </Docs>
    </>
  );
};

export default DocsPage;
