import {FC} from "react";
import {View} from "react-native";
import {ArrowPathIcon} from "react-native-heroicons/outline";
import {Centered, Icon, tw} from "../../helpers/style";

//
// Style.
//

const Spinner = tw(View)`
  animate-spin
`;

const SpinnerIcon = tw(Icon)`
  w-7
  h-7
`;

//
// Component.
//

export const LoadingPosts: FC = () => {
  return (
    <Centered>
      <Spinner>
        <SpinnerIcon>
          <ArrowPathIcon />
        </SpinnerIcon>
      </Spinner>
    </Centered>
  );
};
