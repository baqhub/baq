import {Column} from "@baqhub/ui/core/style.js";
import {FC} from "react";
import tiwi from "tiwi";
import {VisualMessageContent} from "../../../state/messageState.js";
import {MessageImage} from "./messageImage.js";
import {MessageText} from "./messageText.js";

//
// Props.
//

interface MessageContentProps {
  content: VisualMessageContent;
}

//
// Style.
//

const Layout = tiwi(Column)`
  py-1.5
  gap-1
`;

const Images = tiwi(Column)`
  py-0.5
  px-2
  gap-2
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
