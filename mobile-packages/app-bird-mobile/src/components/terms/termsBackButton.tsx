import {Handler} from "@baqhub/sdk";
import {FC, PropsWithChildren} from "react";
import {Pressable} from "react-native";
import tiwi from "tiwi";
import {Text} from "../../helpers/style";

//
// Props.
//

interface TermsBackButtonProps extends PropsWithChildren {
  onPress: Handler;
}

//
// Style.
//

const Layout = tiwi(Pressable)`
  self-center
  group
  flex
  items-center
  p-1
`;

const ButtonText = tiwi(Text)`
  font-medium
  text-base

  text-amber-600
  dark:text-amber-500
  group-active:text-amber-700
  dark:group-active:text-amber-600
`;

//
// Component.
//

export const TermsBackButton: FC<TermsBackButtonProps> = props => {
  const {onPress, children} = props;
  return (
    <Layout onPress={onPress}>
      <ButtonText>{children}</ButtonText>
    </Layout>
  );
};
