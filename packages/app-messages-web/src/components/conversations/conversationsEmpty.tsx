import {ChatBubbleOvalLeftEllipsisIcon} from "@heroicons/react/24/outline";
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

const Icon = tw(ChatBubbleOvalLeftEllipsisIcon)`
  w-9
  h-9
  text-neutral-500
`;

const Label = tw(Text)`
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
