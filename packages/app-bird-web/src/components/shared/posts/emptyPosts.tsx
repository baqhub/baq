import {Column, Row, Text} from "@baqhub/ui/core/style.js";
import {FC, ReactNode} from "react";
import tiwi from "tiwi";

//
// Props.
//

interface EmptyPostsProps {
  icon: ReactNode;
  text: string;
}

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
`;

const Label = tiwi(Text)`
  text-md
`;

//
// Component.
//

export const EmptyPosts: FC<EmptyPostsProps> = props => {
  const {icon, text} = props;
  return (
    <Layout>
      <Content>
        <Icon>{icon}</Icon>
        <Label>{text}</Label>
      </Content>
    </Layout>
  );
};
