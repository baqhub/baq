import {FC} from "react";
import {View} from "react-native";
import {ArrowPathIcon} from "react-native-heroicons/outline";
import tiwi from "tiwi";
import {Centered, Icon} from "../../helpers/style";

//
// Style.
//

const Spinner = tiwi(View)`
  animate-spin
`;

const SpinnerIcon = tiwi(Icon)`
  w-7
  h-7
`;

//
// Component.
//

export const Loading: FC = () => {
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
