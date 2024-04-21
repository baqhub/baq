import {ProxyStore} from "@baqhub/app-bird-shared/build/src/baq/store";
import {Stack, useLocalSearchParams} from "expo-router";
import {FC} from "react";
import {ProfileScreen} from "../../../../components/screens/profileScreen";

//
// Component.
//

const MentionsProfileScreen: FC = () => {
  const {entity} = useLocalSearchParams<{entity: string}>();
  return (
    <ProxyStore entity={entity}>
      <Stack.Screen options={{title: "Profile"}} />
      <ProfileScreen routePrefix="/(mentions)" entity={entity} />
    </ProxyStore>
  );
};

export default MentionsProfileScreen;
