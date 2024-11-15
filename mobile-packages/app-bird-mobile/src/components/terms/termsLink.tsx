import {openBrowserAsync, WebBrowserPresentationStyle} from "expo-web-browser";
import {FC, PropsWithChildren} from "react";
import {Pressable} from "react-native";
import {ArrowTopRightOnSquareIcon} from "react-native-heroicons/outline";
import tiwi from "tiwi";
import {Icon, Text} from "../../helpers/style";

//
// Props.
//

interface TermsLinkProps extends PropsWithChildren {
  to: string;
}

//
// Style.
//

const Layout = tiwi(Pressable)`
  flex
  flex-row

  px-5
  py-4
  gap-2

  items-center
  rounded-lg
  bg-neutral-100
  active:bg-neutral-200
  dark:bg-neutral-800
  dark:active:bg-neutral-900
`;

const LinkText = tiwi(Text)`
  grow
  text-base
`;

const GlobeIcon = tiwi(Icon)`
  w-5
  h-5
`;

//
// Component.
//

export const TermsLink: FC<TermsLinkProps> = props => {
  const {to, children} = props;

  const onPress = () => {
    openBrowserAsync(to, {
      presentationStyle: WebBrowserPresentationStyle.PAGE_SHEET,
      dismissButtonStyle: "done",
    });
  };

  return (
    <Layout style={{borderCurve: "continuous"}} onPress={onPress}>
      <LinkText>{children}</LinkText>
      <GlobeIcon>
        <ArrowTopRightOnSquareIcon />
      </GlobeIcon>
    </Layout>
  );
};
