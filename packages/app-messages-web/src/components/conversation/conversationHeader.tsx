import {Row, Text} from "@baqhub/ui/core/style.js";
import {FC} from "react";
import tiwi from "tiwi";

//
// Props.
//

interface ConversationHeaderProps {
  recipient: string;
}

//
// Style.
//

const Layout = tiwi(Row)`
  sticky
  top-0

  bg-neutral-200
`;

const Title = tiwi(Text)`
  px-3
  pt-6
  pb-3

  text-2xl
  font-semibold
`;

//
// Component.
//

export const ConversationHeader: FC<ConversationHeaderProps> = props => {
  const {recipient} = props;
  return (
    <Layout>
      <Title>{recipient}</Title>
    </Layout>
  );
};
