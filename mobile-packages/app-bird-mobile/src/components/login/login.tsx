import {Async, HandlerOf} from "@baqhub/sdk";
import {
  abortable,
  ConnectStatus,
  UnauthenticatedState,
} from "@baqhub/sdk-react";
import {openAuthSessionAsync} from "expo-web-browser";
import {FC, useCallback, useEffect, useRef, useState} from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  View,
} from "react-native";
import tiwi from "tiwi";
import birdLogo from "../../../assets/images/birdMobileLogo.png";
import {Centered} from "../../helpers/style";
import {Button} from "../core/button";
import {TextBox} from "../core/textBox";

//
// Props.
//

interface LoginProps {
  redirectUrl: string;
  state: UnauthenticatedState;
  onContinuePress: HandlerOf<string>;
  onAuthResult: HandlerOf<string | undefined>;
}

//
// Style.
//

const SafeArea = tiwi(SafeAreaView)`
  flex-1
  bg-white
  dark:bg-neutral-950
`;

const Layout = tiwi(Centered)`
  gap-16
`;

const EntityLayout = tiwi(View)`
  self-stretch
  items-start
  flex-row
  gap-2
  px-10
`;

//
// Component.
//

export const Login: FC<LoginProps> = props => {
  const {redirectUrl, state, onContinuePress, onAuthResult} = props;
  const isConnecting = state.connectStatus !== ConnectStatus.IDLE;
  const [hasFocus, setHasFocus] = useState(false);

  const entityRef = useRef("");
  const onEntityChange = useCallback((newEntity: string) => {
    entityRef.current = newEntity;
  }, []);

  const onContinueButtonPress = () => {
    const currentEntity = entityRef.current;
    if (currentEntity.length < 4) {
      return;
    }

    onContinuePress(currentEntity);
  };

  useEffect(() => {
    if (state.connectStatus !== ConnectStatus.WAITING_ON_FLOW) {
      return;
    }

    return abortable(async signal => {
      const result = await openAuthSessionAsync(state.flowUrl, redirectUrl);
      Async.throwIfAborted(signal);

      if (result.type !== "success") {
        onAuthResult(undefined);
        return;
      }

      onAuthResult(result.url);
    });
  }, [state, redirectUrl, onAuthResult]);

  return (
    <SafeArea>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Layout>
          <Image source={birdLogo} />
          <EntityLayout>
            <TextBox
              placeholder="user.host.com"
              isDisabled={isConnecting}
              defaultValue={entityRef.current}
              enterKeyHint="go"
              onFocus={() => setHasFocus(true)}
              onBlur={() => setHasFocus(false)}
              onChange={onEntityChange}
              onSubmit={onContinueButtonPress}
            />
            <Button
              variant="primary"
              isDisabled={isConnecting}
              isFeatured={hasFocus}
              onPress={onContinueButtonPress}
            >
              Sign in
            </Button>
          </EntityLayout>
        </Layout>
      </KeyboardAvoidingView>
    </SafeArea>
  );
};
