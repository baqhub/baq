import {Column, Row, Text, tw} from "@baqhub/ui/core/style.js";
import {ArrowPathIcon} from "@heroicons/react/24/outline";
import {FC} from "react";

//
// Style.
//

const Layout = tw(Column)`
  grow
  items-center
  justify-center
`;

const Content = tw(Row)`
  gap-3
  items-center
`;

const Icon = tw(Text)`
  w-6
  h-6
  animate-spin
`;

const Label = tw(Text)`
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
