import {ArrowPathIcon} from "@heroicons/react/24/outline";
import {Column, Text, tw} from "@baqhub/ui/core/style.js";
import {FC} from "react";

//
// Style.
//

const Layout = tw(Column)`
  items-center
  justify-center
  gap-3
`;

const Icon = tw(ArrowPathIcon)`
  w-9
  h-9
  text-neutral-600
`;

const Label = tw(Text)`
  max-w-full

  text-neutral-700
  text-md
  truncate
`;

//
// Component.
//

export const ConversationLoading: FC = () => {
  return (
    <Layout>
      <Icon />
      <Label>Loading</Label>
    </Layout>
  );
};
