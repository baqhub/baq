import {Handler} from "@baqhub/sdk";
import {FC, PropsWithChildren} from "react";
import {Pressable} from "react-native";
import tiwi from "tiwi";
import {Icon} from "../../helpers/style";

//
// Props.
//

interface ToolbarButtonProps extends PropsWithChildren {
  onPress: Handler;
}

//
// Style.
//

const Button = tiwi(Pressable)`
  py-1
  px-0.5
  active:opacity-60
`;

const ButtonIcon = tiwi(Icon)`
  w-7
  h-7
  text-amber-400
  dark:text-amber-500
`;

//
// Component.
//

export const ToolbarButton: FC<ToolbarButtonProps> = props => {
  const {onPress, children} = props;

  return (
    <Button onPress={onPress}>
      <ButtonIcon>{children}</ButtonIcon>
    </Button>
  );
};
