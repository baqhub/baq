import {Row, Text} from "@baqhub/ui/core/style.js";
import {ArrowPathIcon} from "@heroicons/react/24/outline";
import {FC} from "react";
import tiwi from "tiwi";

//
// Style.
//

const Layout = tiwi(Row)`
  items-center
  justify-center
  gap-2
  p-7
`;

const Icon = tiwi(ArrowPathIcon)`
  w-6
  h-6
  text-neutral-500
  shrink-0
`;

const Label = tiwi(Text)`
  text-neutral-600
  text-md
  truncate
`;

//
// Component.
//

export const ItemListLoading: FC = () => {
  return (
    <Layout>
      <Icon />
      <Label>Loading</Label>
    </Layout>
  );
};
