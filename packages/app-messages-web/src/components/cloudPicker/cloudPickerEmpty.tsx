import {Row, Text} from "@baqhub/ui/core/style.js";
import {PhotoIcon} from "@heroicons/react/24/outline";
import {FC} from "react";
import tiwi from "tiwi";

//
// Style.
//

const Layout = tiwi(Row)`
  h-full
  items-center
  justify-center
  gap-2
  p-7
`;

const Icon = tiwi(PhotoIcon)`
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

export const CloudPickerEmpty: FC = () => {
  return (
    <Layout>
      <Icon />
      <Label>No pictures found.</Label>
    </Layout>
  );
};
