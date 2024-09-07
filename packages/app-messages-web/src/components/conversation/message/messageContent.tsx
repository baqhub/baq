import {Column, tw} from "@baqhub/ui/core/style.js";
import {FC} from "react";
import {VisualMessageContent} from "../../../state/messageState.js";
import {MessageImage} from "./messageImage.js";

//
// Props.
//

interface MessageContentProps {
  content: VisualMessageContent;
}

//
// Style.
//

const Layout = tw(Column)`
  py-1.5
  gap-1
`;

const Images = tw(Column)`
  py-0.5
  px-2
  gap-2
`;

const MessageText = tw.div`
  px-3
  text-neutral-900
`;

//
// Component.
//

export const MessageContent: FC<MessageContentProps> = props => {
  const {content} = props;
  return (
    <Layout>
      {"images" in content && (
        <Images>
          {content.images.map((i, index) => (
            <MessageImage
              key={index}
              url={i.url}
              width={i.width}
              height={i.height}
            />
          ))}
        </Images>
      )}
      {content.text && <MessageText>{content.text}</MessageText>}
    </Layout>
  );
};
