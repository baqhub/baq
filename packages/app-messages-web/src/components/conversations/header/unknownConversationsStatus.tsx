import {Row, Text, tw} from "@baqhub/ui/core/style.js";
import {FC, PropsWithChildren, ReactNode} from "react";

//
// Props.
//

interface UnknownConversationsStatusProps extends PropsWithChildren {
  icon: ReactNode;
}

//
// Style.
//

const Layout = tw(Row)`
  h-16
  items-center
  justify-center
  gap-2
`;

const Icon = tw.div`
  w-6
  h-6
  text-neutral-500
  shrink-0
`;

const Label = tw(Text)`
  text-neutral-600
  text-md
  truncate
`;

//
// Component.
//

export const UnknownConversationsStatus: FC<
  UnknownConversationsStatusProps
> = props => {
  const {icon, children} = props;
  return (
    <Layout>
      <Icon>{icon}</Icon>
      <Label>{children}</Label>
    </Layout>
  );
};
