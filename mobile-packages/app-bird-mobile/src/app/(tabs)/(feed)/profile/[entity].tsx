import {ProxyStore} from "@protocol-apps/app-bird-shared/build/src/baq/store";
import {Stack, useLocalSearchParams} from "expo-router";
import {FC} from "react";
import {ProfileScreen} from "../../../../components/screens/profileScreen";

//
// Component.
//

const FeedProfileScreen: FC = () => {
  const {entity} = useLocalSearchParams<{entity: string}>();
  return (
    <ProxyStore entity={entity}>
      <Stack.Screen options={{title: "Profile"}} />
      <ProfileScreen routePrefix="/(feed)" entity={entity} />
    </ProxyStore>
  );
};

export default FeedProfileScreen;
