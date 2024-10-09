import {FC} from "react";
import {View} from "react-native";
import {ArrowPathIcon} from "react-native-heroicons/outline";
import {Icon, tw} from "../../helpers/style";

//
// Style.
//

const Layout = tw(View)`
  items-center
  p-5
`;

const Spinner = tw(View)`
  w-7
  h-7
  animate-spin
`;

const SpinnerIcon = tw(Icon)`
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
