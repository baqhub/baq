import {ProxyStore} from "@baqhub/app-bird-shared/build/src/baq/store";
import {useLocalSearchParams} from "expo-router";
import {FC} from "react";
import {PostScreen} from "../../../../components/screens/postScreen";

//
// Component.
//

const FeedPostScreen: FC = () => {
  const {proxyEntity, postKey} = useLocalSearchParams<{
    proxyEntity: string;
    postKey: string;
  }>();

  return (
    <ProxyStore entity={proxyEntity}>
      <PostScreen routePrefix="/(feed)" postKey={postKey} />
    </ProxyStore>
  );
};

export default FeedPostScreen;
