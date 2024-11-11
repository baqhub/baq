import {Column, Text} from "@baqhub/ui/core/style.js";
import {ArrowPathIcon} from "@heroicons/react/24/outline";
import {FC} from "react";
import tiwi from "tiwi";

//
// Props.
//

interface LoadingMorePostsProps {
  isLoading: boolean;
}

//
// Style.
//

const Layout = tiwi(Column)`
  h-14
  items-center
  justify-center
`;

const Icon = tiwi(Text)`
  w-6
  h-6
  animate-spin
`;

//
// Component.
//

export const LoadingMorePosts: FC<LoadingMorePostsProps> = ({isLoading}) => {
  return (
    <Layout>
      {isLoading && (
        <Icon>
          <ArrowPathIcon />
        </Icon>
      )}
    </Layout>
  );
};
