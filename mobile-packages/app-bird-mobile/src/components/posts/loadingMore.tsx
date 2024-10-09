import {FC} from "react";
import {View} from "react-native";
import {ArrowPathIcon} from "react-native-heroicons/outline";
import {Centered, Icon, tw} from "../../helpers/style";

//
// Props.
//

interface LoadingMoreProps {
  isLoading: boolean;
}

//
// Style.
//

const Layout = tw(View)`
  my-10
  w-7
  h-7
`;

const Spinner = tw(View)`
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
