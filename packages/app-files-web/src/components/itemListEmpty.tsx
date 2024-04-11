import {FolderIcon} from "@heroicons/react/24/outline";
import {Row, Text, tw} from "@baqhub/ui/core/style.js";
import {FC} from "react";

//
// Style.
//

const Layout = tw(Row)`
  items-center
  justify-center
  gap-2
  p-7
`;

const Icon = tw(FolderIcon)`
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

export const ItemListEmpty: FC = () => {
  return (
    <Layout>
      <Icon />
      <Label>This folder is empty.</Label>
    </Layout>
  );
};
