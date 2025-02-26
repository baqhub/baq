import {Column} from "@baqhub/ui/core/style.jsx";
import {FC} from "react";
import tiwi from "tiwi";
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

const Layout = tiwi(Column)`
  py-4
  gap-3
`;

const SubPageLink = tiwi(Link)`
  group
  block
`;

const SubPageLayout = tiwi(Column)`
  py-3
  px-4
  gap-1

  rounded-lg
  border
  border-zinc-200
  dark:border-zinc-700

  group-hover:bg-zinc-50
  group-active:bg-zinc-100
  dark:group-hover:bg-zinc-700
  dark:group-active:bg-zinc-600
`;

const Title = tiwi.div`
  text-xl
  font-medium
  text-amber-700
  dark:text-amber-500
`;

const Summary = tiwi.div`
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
