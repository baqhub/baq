import {Column, tw} from "@baqhub/ui/core/style.js";
import {FC} from "react";
import {DocsPageFull} from "../../../../services/docs.js";
import {Link} from "../../../global/link.jsx";

//
// Props.
//

interface SubPagesProps {
  pages: ReadonlyArray<DocsPageFull>;
}

//
// Style.
//

const Layout = tw(Column)`
  py-4
  gap-3
`;

const SubPageLink = tw(Link)`
  group
  block
`;

const SubPageLayout = tw(Column)`
  py-3
  px-4
  gap-1

  rounded-lg
  border
  border-zinc-200
  dark:border-zinc-700

  any-hover:group-hover:bg-zinc-50
  group-active:bg-zinc-100
  any-hover:group-active:bg-zinc-100
  dark:any-hover:group-hover:bg-zinc-700
  dark:group-active:bg-zinc-600
  dark:any-hover:group-active:bg-zinc-600
`;

const Title = tw.div`
  font-medium
  text-xl
  text-amber-700
  dark:text-amber-500
`;

const Summary = tw.div`
  h-12
  sm:h-auto
  line-clamp-2
  sm:line-clamp-1
  text-zinc-900
  dark:text-white
`;

//
// Component.
//

export const SubPages: FC<SubPagesProps> = ({pages}) => {
  return (
    <Layout>
      {pages.map(p => (
        <SubPage key={p.path} page={p} />
      ))}
    </Layout>
  );
};

const SubPage: FC<{page: DocsPageFull}> = ({page}) => {
  const to = `/docs/${page.section}/${page.path}`;
  return (
    <SubPageLink href={to}>
      <SubPageLayout>
        <Title>{page.title}</Title>
        {page.summary && <Summary>{page.summary}</Summary>}
      </SubPageLayout>
    </SubPageLink>
  );
};
