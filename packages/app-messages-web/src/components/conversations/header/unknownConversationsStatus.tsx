import {Row, Text} from "@baqhub/ui/core/style.js";
import {FC, PropsWithChildren, ReactNode} from "react";
import tiwi from "tiwi";

//
// Props.
//

interface UnknownConversationsStatusProps extends PropsWithChildren {
  icon: ReactNode;
}

//
// Style.
//

const Layout = tiwi(Row)`
  h-16
  items-center
  justify-center
  gap-2
`;

const Icon = tiwi.div`
  h-6
  w-6
  shrink-0
  text-neutral-500
`;

const Label = tiwi(Text)`
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
