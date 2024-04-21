import {ProxyStore} from "@protocol-apps/app-bird-shared/build/src/baq/store";
import {useLocalSearchParams} from "expo-router";
import {FC} from "react";
import {PostScreen} from "../../../../components/screens/postScreen";

//
// Component.
//

const MePostScreen: FC = () => {
  const {proxyEntity, postKey} = useLocalSearchParams<{
    proxyEntity: string;
    postKey: string;
  }>();

  return (
    <ProxyStore entity={proxyEntity}>
      <PostScreen routePrefix="/(me)" postKey={postKey} />
    </ProxyStore>
  );
};

export default MePostScreen;
