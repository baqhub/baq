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
  w-80
  rounded-lg
  bg-neutral-900/10
  overflow-hidden
`;

const Image = tw.img`
  w-full
`;

//
// Component.
//

export const MessageImage: FC<MessageImageProps> = props => {
  const {url, width, height} = props;
  return (
    <Layout style={{aspectRatio: width / height}}>
      <Image src={url} />
    </Layout>
  );
};
