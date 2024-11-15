import {FC, PropsWithChildren, ReactNode} from "react";
import tiwi from "tiwi";
import {Centered, Icon, Text} from "../../helpers/style";

//
// Props.
//

interface EmptyPostsProps extends PropsWithChildren {
  icon: ReactNode;
}

//
// Style.
//

const Layout = tiwi(Centered)`
  gap-2
  flex-row
`;

const EmptyIcon = tiwi(Icon)`
  text-neutral-400
  dark:text-neutral-600
`;

const EmptyText = tiwi(Text)`
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
