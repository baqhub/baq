import {Column, Row, Text} from "@baqhub/ui/core/style.js";
import {ArrowPathIcon} from "@heroicons/react/24/outline";
import {FC} from "react";
import tiwi from "tiwi";

//
// Style.
//

const Layout = tiwi(Column)`
  grow
  items-center
  justify-center
`;

const Content = tiwi(Row)`
  gap-3
  items-center
`;

const Icon = tiwi(Text)`
  w-6
  h-6
  animate-spin
`;

const Label = tiwi(Text)`
  text-md
`;

//
// Component.
//

export const LoadingPosts: FC = () => {
  return (
    <Layout>
      <Content>
        <Icon>
          <ArrowPathIcon />
        </Icon>
        <Label>Loading...</Label>
      </Content>
    </Layout>
  );
};
