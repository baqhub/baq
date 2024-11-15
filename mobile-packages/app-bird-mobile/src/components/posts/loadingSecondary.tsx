import {FC} from "react";
import {View} from "react-native";
import {ArrowPathIcon} from "react-native-heroicons/outline";
import tiwi from "tiwi";
import {Icon} from "../../helpers/style";

//
// Style.
//

const Layout = tiwi(View)`
  items-center
  p-5
`;

const Spinner = tiwi(View)`
  w-7
  h-7
  animate-spin
`;

const SpinnerIcon = tiwi(Icon)`
  w-7
  h-7
  text-neutral-500
  dark:text-neutral-500
`;

//
// Component.
//

export const LoadingSecondary: FC = () => {
  return (
    <Layout>
      <Spinner>
        <SpinnerIcon>
          <ArrowPathIcon />
        </SpinnerIcon>
      </Spinner>
    </Layout>
  );
};
