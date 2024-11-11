import {Column, Text} from "@baqhub/ui/core/style.js";
import {ArrowPathIcon} from "@heroicons/react/24/outline";
import {FC} from "react";
import tiwi from "tiwi";

//
// Style.
//

const Layout = tiwi(Column)`
  items-center
  justify-center
  gap-3
`;

const Icon = tiwi(ArrowPathIcon)`
  w-9
  h-9
  text-neutral-600
`;

const Label = tiwi(Text)`
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
