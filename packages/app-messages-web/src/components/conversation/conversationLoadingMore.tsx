import {Column, Text, tw} from "@baqhub/ui/core/style.js";
import {ArrowPathIcon} from "@heroicons/react/24/outline";
import {FC} from "react";

//
// Style.
//

const Layout = tw(Column)`
  h-10
  items-center
  justify-center
`;

const Icon = tw(Text)`
  w-6
  h-6
`;

//
// Component.
//

export const ConversationLoadingMore: FC = () => {
  return (
    <Layout>
      <Icon>
        <ArrowPathIcon />
      </Icon>
    </Layout>
  );
};
