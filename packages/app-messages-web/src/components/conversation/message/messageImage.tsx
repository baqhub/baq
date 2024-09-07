import {tw} from "@baqhub/ui/core/style.js";
import {FC} from "react";

//
// Props.
//

interface MessageImageProps {
  url: string;
  width: number;
  height: number;
}

//
// Style.
//

const Layout = tw.div`
  max-w-80
  max-h-96
  rounded-lg
  bg-neutral-900/10
  overflow-hidden
`;

//
// Component.
//

export const MessageImage: FC<MessageImageProps> = props => {
  const {url, width, height} = props;
  return (
    <Layout style={{aspectRatio: width / height}}>
      <img src={url} />
    </Layout>
  );
};
