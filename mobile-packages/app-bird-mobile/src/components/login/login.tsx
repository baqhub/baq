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
  Keyboard,
  KeyboardAvoidingView,
  SafeAreaView,
  TextInput,
  View,
} from "react-native";
import birdLogo from "../../../assets/images/birdMobileLogo.png";
import {Centered, tw} from "../../helpers/style";
import {Button} from "../core/button";

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

const SafeArea = tw(SafeAreaView)`
  flex-1
  bg-white
  dark:bg-neutral-950
`;

const Layout = tw(Centered)`
  gap-16
`;

const EntityLayout = tw(View)`
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

  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!isRefreshing) {
      return;
    }

    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  }, [isRefreshing]);

  const entityRef = useRef("");
  const onEntityChange = useCallback((newEntity: string) => {
    entityRef.current = newEntity;
  }, []);

  const onContinueButtonPress = () => {
    Keyboard.dismiss();
    return;

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

  console.log("Re-rendering", Date.now());
  if (isRefreshing) {
    return null;
  }

  return (
    <SafeArea collapsable={false}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior="padding"
        collapsable={false}
      >
        <Layout collapsable={false}>
          <Image source={birdLogo} />
          <EntityLayout>
            <TextInput
              placeholder="user.host.com"
              // isDisabled={isConnecting}
              defaultValue={entityRef.current}
              enterKeyHint="go"
              onFocus={() => setHasFocus(true)}
              onBlur={() => setHasFocus(false)}
              // onChange={onEntityChange}
              // onSubmit={onContinueButtonPress}
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
