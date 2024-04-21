import {Store} from "@baqhub/app-bird-shared/build/src/baq/store";
import {DateServicesProvider} from "@baqhub/app-bird-shared/build/src/components/date/dateServicesProvider";
import {buildAppState} from "@baqhub/app-bird-shared/build/src/state/appState";
import {asyncStorageAdapter, secureStorageAdapter} from "@baqhub/sdk-expo";
import {DarkTheme, DefaultTheme, ThemeProvider} from "@react-navigation/native";
import {Locale, useLocales} from "expo-localization";
import {SplashScreen, Stack} from "expo-router";
import {FC, Suspense, useCallback} from "react";
import {useColorScheme} from "react-native";
import {Login} from "../components/login/login";
import {Splash} from "../components/splash";
import "../style/index.css";

//
// Configuration.
//

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

const birdIconUrl = "https://bird.baq.dev/assets/birdIcon-n2MYINEF.png";
const redirectUrlPrefix = "bird://auth";
const redirectUrl = `${redirectUrlPrefix}{/authorization_id}`;
const {useAppState} = buildAppState({
  storage: asyncStorageAdapter,
  secureStorage: secureStorageAdapter,
});

//
// Component.
//

SplashScreen.preventAutoHideAsync();

const RootLayout: FC = () => {
  return (
    <Suspense>
      <Splash>
        <RootLayoutContent />
      </Splash>
    </Suspense>
  );
};

function RootLayoutContent() {
  const colorScheme = useColorScheme();
  const [locale] = useLocales() as [Locale];

  const appState = useAppState({
    appIconUrl: birdIconUrl,
    redirectUrl,
  });
  const {state, onAuthorizationResult} = appState;
  const {onConnectRequest, onDisconnectRequest} = appState;

  const onAuthUrl = useCallback(
    (authUrl: string | undefined) => {
      if (!authUrl || !authUrl.startsWith(redirectUrlPrefix)) {
        onAuthorizationResult();
        return;
      }

      const authorizationId = authUrl.slice(redirectUrlPrefix.length + 1);
      onAuthorizationResult(authorizationId);
    },
    [onAuthorizationResult]
  );

  if (state.status === "unauthenticated") {
    return (
      <Login
        redirectUrl={redirectUrlPrefix}
        state={state}
        onContinuePress={onConnectRequest}
        onAuthResult={onAuthUrl}
      />
    );
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <DateServicesProvider locale={locale.languageTag}>
        <Store
          identity={state.identity}
          onDisconnectRequest={onDisconnectRequest}
        >
          <Stack>
            <Stack.Screen name="(tabs)" options={{headerShown: false}} />
            <Stack.Screen
              name="searchModal"
              options={{
                presentation: "transparentModal",
                animation: "fade",
                headerShown: false,
                contentStyle: {backgroundColor: "transparent"},
              }}
            />
            <Stack.Screen
              name="postComposerModal"
              options={{presentation: "modal", headerStyle: {}}}
            />
          </Stack>
        </Store>
      </DateServicesProvider>
    </ThemeProvider>
  );
}

export default RootLayout;
