import {FC, PropsWithChildren, ReactNode} from "react";
import {Centered, Icon, Text, tw} from "../../helpers/style";

//
// Props.
//

interface EmptyPostsProps extends PropsWithChildren {
  icon: ReactNode;
}

//
// Style.
//

const Layout = tw(Centered)`
  gap-2
  flex-row
`;

const EmptyIcon = tw(Icon)`
  text-neutral-400
  dark:text-neutral-600
`;

const EmptyText = tw(Text)`
  text-center
  text-base
  text-neutral-400
  dark:text-neutral-600
`;

//
// Component.
//

export const EmptyPosts: FC<EmptyPostsProps> = props => {
  const {icon, children} = props;
  return (
    <Layout>
      <EmptyIcon>{icon}</EmptyIcon>
      <EmptyText>{children}</EmptyText>
    </Layout>
  );
};
