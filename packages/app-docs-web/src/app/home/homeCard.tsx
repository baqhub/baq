import {Column, tw} from "@baqhub/ui/core/style.jsx";
import {FC, PropsWithChildren, ReactNode} from "react";
import {TextSelect} from "../global/style.jsx";

//
// Props.
//

interface HomeCardProps extends PropsWithChildren {
  icon: ReactNode;
  title: ReactNode;
}

//
// Style.
//

const Layout = tw(Column)`
  p-6
  gap-4
  items-start

  rounded-xl
  bg-zinc-100
  dark:bg-zinc-900
`;

const IconLayout = tw.div`
  p-1.5
  rounded-lg
  bg-amber-400/40
  dark:bg-amber-950
`;

const Icon = tw.div`
  h-7
  w-7
  text-amber-700
  dark:text-amber-500
`;

const Content = tw(Column)`
  gap-2
`;

const Title = tw(TextSelect)`
  text-lg
  font-medium
`;

const Description = tw(TextSelect)`
  text-zinc-500
  dark:text-zinc-400
`;

//
// Component.
//

export const HomeCard: FC<HomeCardProps> = props => {
  const {icon, title, children} = props;
  return (
    <Layout>
      <IconLayout>
        <Icon>{icon}</Icon>
      </IconLayout>
      <Content>
        <Title>{title}</Title>
        <Description>{children}</Description>
      </Content>
    </Layout>
  );
};
