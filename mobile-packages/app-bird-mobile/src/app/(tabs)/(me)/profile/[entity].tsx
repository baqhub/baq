import {
  ProxyStore,
  useRecordHelpers,
} from "@baqhub/app-bird-shared/build/src/baq/store";
import {useConstant} from "@baqhub/sdk-react";
import {Stack, useLocalSearchParams, useNavigation} from "expo-router";
import {FC, useCallback} from "react";
import {Alert} from "react-native";
import {ArrowRightOnRectangleIcon} from "react-native-heroicons/outline";
import {ToolbarButton} from "../../../../components/core/toolbarButton";
import {ProfileScreen} from "../../../../components/screens/profileScreen";

//
// Component.
//

const MeProfileScreen: FC = () => {
  const {entity} = useLocalSearchParams<{entity: string}>();
  if (!entity) {
    throw new Error("Param is needed.");
  }

  const navigation = useNavigation();
  const isInitial = useConstant(() => navigation.getState().index === 0);
  const title = isInitial ? "My Profile" : "Profile";

  return (
    <ProxyStore entity={entity}>
      <Stack.Screen
        options={{
          title,
          headerRight: ({canGoBack}) => <HeaderRight canGoBack={canGoBack} />,
        }}
      />
      <ProfileScreen routePrefix="/(me)" entity={entity} />
    </ProxyStore>
  );
};

const HeaderRight: FC<{canGoBack: boolean}> = props => {
  const {canGoBack} = props;
  const {entity, onDisconnectRequest} = useRecordHelpers();

  const onButtonPress = useCallback(() => {
    Alert.alert("Sign out", `Remove the BAQ account ${entity} from this app?`, [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Sign out",
        style: "destructive",
        onPress: onDisconnectRequest,
      },
    ]);
  }, [entity, onDisconnectRequest]);

  if (canGoBack) {
    return null;
  }

  return (
    <ToolbarButton onPress={onButtonPress}>
      <ArrowRightOnRectangleIcon />
    </ToolbarButton>
  );
};

export default MeProfileScreen;
