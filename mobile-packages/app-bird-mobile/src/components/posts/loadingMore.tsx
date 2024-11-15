import {FC} from "react";
import {View} from "react-native";
import {ArrowPathIcon} from "react-native-heroicons/outline";
import tiwi from "tiwi";
import {Centered, Icon} from "../../helpers/style";

//
// Props.
//

interface LoadingMoreProps {
  isLoading: boolean;
}

//
// Style.
//

const Layout = tiwi(View)`
  my-10
  w-7
  h-7
`;

const Spinner = tiwi(View)`
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

export const LoadingMore: FC<LoadingMoreProps> = props => {
  const {isLoading} = props;
  return (
    <Centered>
      <Layout>
        {isLoading && (
          <Spinner>
            <SpinnerIcon>
              <ArrowPathIcon />
            </SpinnerIcon>
          </Spinner>
        )}
      </Layout>
    </Centered>
  );
};
