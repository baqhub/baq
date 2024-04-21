import {Stack} from "expo-router";
import {FC} from "react";
import {useColorScheme} from "react-native";
import {amber, neutral, white} from "tailwindcss/colors";

//
// Component.
//

const OwnProfileStackLayout: FC = () => {
  const colorScheme = useColorScheme();
  const isLight = colorScheme === "light";

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: isLight ? white : neutral[950],
        },
        headerShadowVisible: false,
        headerBackTitleVisible: false,
        headerTintColor: isLight ? amber[400] : amber[500],
        headerTitleStyle: {
          color: isLight ? neutral[950] : white,
        },
      }}
    />
  );
};

export default OwnProfileStackLayout;
