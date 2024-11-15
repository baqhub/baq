import {Column, Text} from "@baqhub/ui/core/style.js";
import {ChatBubbleOvalLeftEllipsisIcon} from "@heroicons/react/24/outline";
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

const Icon = tiwi(ChatBubbleOvalLeftEllipsisIcon)`
  w-9
  h-9
  text-neutral-500
`;

const Label = tiwi(Text)`
  max-w-full

  text-neutral-600
  text-md
  truncate
`;

//
// Component.
//

export const ConversationsEmpty: FC = () => {
  return (
    <Layout>
      <Icon />
      <Label>No conversations.</Label>
    </Layout>
  );
};
