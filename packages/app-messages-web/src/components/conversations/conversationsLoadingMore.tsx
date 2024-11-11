import {Column, Text} from "@baqhub/ui/core/style.js";
import {ArrowPathIcon} from "@heroicons/react/24/outline";
import {FC} from "react";
import tiwi from "tiwi";

//
// Style.
//

const Layout = tiwi(Column)`
  p-2
  items-center
`;

const Icon = tiwi(Text)`
  w-6
  h-6
`;

//
// Component.
//

export const ConversationsLoadingMore: FC = () => {
  return (
    <Layout>
      <Icon>
        <ArrowPathIcon />
      </Icon>
    </Layout>
  );
};
