import {Stack as RNStack} from "expo-router";
import {FC, PropsWithChildren} from "react";
import {useColorScheme} from "react-native";
import {amber, neutral, white} from "tailwindcss/colors";

export const Stack: FC<PropsWithChildren> = () => {
  const colorScheme = useColorScheme();
  const isLight = colorScheme === "light";

  return (
    <RNStack
      screenOptions={{
        headerStyle: {
          backgroundColor: isLight ? white : neutral[950],
        },
        headerShadowVisible: false,
        headerBackTitle: undefined,
        headerTintColor: isLight ? amber[400] : amber[500],
        headerTitleStyle: {
          color: isLight ? neutral[950] : white,
        },
      }}
    />
  );
};
