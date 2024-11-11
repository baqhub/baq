import {Column, Row} from "@baqhub/ui/core/style.js";
import {FC} from "react";
import tiwi from "tiwi";
import {useHomeState} from "../state/homeState.js";
import {Breadcrumbs} from "./breadcrumbs.js";
import {FileDrop} from "./fileDrop.js";
import {ItemList} from "./itemList.js";
import {NewFolderButton} from "./toolbar/newFolderButton.js";

//
// Style.
//

const Layout = tiwi(Row)`
  relative
  min-h-0
  bg-neutral-200
  justify-center
`;

const Page = tiwi(Column)`
  relative
  pb-4
  grow
  max-w-lg
`;

const Toolbar = tiwi(Row)`
  shrink-0
  py-3
  gap-3
`;

const Separator = tiwi.div`
  h-px
  shrink-0
  bg-neutral-200
`;

const Content = tiwi(Column)`
  px-3
  shrink
  min-h-0
  rounded-xl
  bg-white
`;

//
// Component.
//

export const Home: FC = () => {
  const homeState = useHomeState();
  const {provider, isLoading, getItemKeys} = homeState;

  return provider(
    <Layout>
      <Page>
        <Breadcrumbs />
        <Content>
          <Toolbar>
            <NewFolderButton />
          </Toolbar>
          <Separator />
          <ItemList isLoading={isLoading} getItemKeys={getItemKeys} />
        </Content>
      </Page>
      <FileDrop />
    </Layout>
  );
};
