import {PhotoIcon} from "@heroicons/react/24/outline";
import {Row, Text, tw} from "@baqhub/ui/core/style.js";
import {FC} from "react";

//
// Style.
//

const Layout = tw(Row)`
  h-full
  items-center
  justify-center
  gap-2
  p-7
`;

const Icon = tw(PhotoIcon)`
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

export const CloudPickerEmpty: FC = () => {
  return (
    <Layout>
      <Icon />
      <Label>No pictures found.</Label>
    </Layout>
  );
};
