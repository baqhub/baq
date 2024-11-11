import {Column, Text} from "@baqhub/ui/core/style.js";
import {ChatBubbleLeftRightIcon} from "@heroicons/react/24/outline";
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

const Icon = tiwi(ChatBubbleLeftRightIcon)`
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

export const ConversationEmpty: FC = () => {
  return (
    <Layout>
      <Icon />
      <Label>No conversation selected.</Label>
    </Layout>
  );
};
