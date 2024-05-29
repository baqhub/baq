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

const Layout = tw(Column)``;

const Images = tw(Column)`
  p-2
  pb-0
  gap-2
`;

const MessageText = tw.div`
  px-3
  py-1.5
  text-neutral-900
`;

//
// Component.
//

export const MessageContent: FC<MessageContentProps> = props => {
  const {content} = props;

  if ("images" in content) {
    return (
      <Layout>
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
        {content.text && <MessageText>{content.text}</MessageText>}
      </Layout>
    );
  }

  return <MessageText>{content.text}</MessageText>;
};
