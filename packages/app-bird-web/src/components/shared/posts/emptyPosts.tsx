import {Column, Row, Text, tw} from "@baqhub/ui/core/style.js";
import {FC, ReactNode} from "react";

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
`;

const Label = tw(Text)`
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
