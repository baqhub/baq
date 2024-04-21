import {useRecordHelpers} from "@baqhub/app-bird-shared/build/src/baq/store";
import {Tabs, router} from "expo-router";
import {FC, useCallback} from "react";
import {useColorScheme} from "react-native";
import {AtSymbolIcon} from "react-native-heroicons/outline";
import {HomeIcon, PencilIcon, UserIcon} from "react-native-heroicons/solid";
import {amber, neutral, white} from "tailwindcss/colors";
import {Icon, tw} from "../../helpers/style";

//
// Style.
//

const TabIcon = tw(Icon)`
  -mb-[3px]
  w-7
  h-7
`;

//
// Component.
//

interface NavigationEvent {
  preventDefault(): void;
}

const TabLayout: FC = () => {
  const {entity} = useRecordHelpers();
  const colorScheme = useColorScheme();
  const isLight = colorScheme === "light";

  const onComposeClick = useCallback((e: NavigationEvent) => {
    e.preventDefault();
    router.push("/postComposerModal");
  }, []);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: isLight ? amber[400] : amber[500],
        tabBarShowLabel: false,
        tabBarStyle: {
          borderTopWidth: 0,
          backgroundColor: isLight ? white : neutral[950],
        },
        headerStyle: {
          backgroundColor: isLight ? white : neutral[950],
        },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="(feed)"
        options={{
          headerShown: false,
          tabBarIcon: ({color}) => (
            <TabIcon>
              <HomeIcon color={color} />
            </TabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="(mentions)"
        options={{
          headerShown: false,
          tabBarIcon: ({color}) => (
            <TabIcon>
              <AtSymbolIcon
                strokeWidth={2.5}
                width={30}
                height={30}
                color={color}
              />
            </TabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="placeholder"
        listeners={{tabPress: onComposeClick}}
        options={{
          tabBarIcon: ({color}) => (
            <TabIcon>
              <PencilIcon color={color} width={26} height={26} />
            </TabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="(me)"
        options={{
          headerShown: false,
          href: {
            pathname: "/(me)/profile/[entity]",
            params: {entity},
          },
          tabBarIcon: ({color}) => (
            <TabIcon>
              <UserIcon color={color} />
            </TabIcon>
          ),
        }}
      />
    </Tabs>
  );
};

export default TabLayout;
