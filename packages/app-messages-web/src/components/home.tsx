import {Grid} from "@baqhub/ui/core/style.js";
import {FC} from "react";
import tiwi from "tiwi";
import {useHomeState} from "../state/homeState.js";
import {Conversation} from "./conversation/conversation.js";
import {Conversations} from "./conversations/conversations.js";

//
// Style.
//

const Layout = tiwi(Grid)`
  grid-cols-[16rem_1fr]
  grid-flow-col
`;

//
// Component.
//

export const Home: FC = () => {
  const homeState = useHomeState();
  const {selectedKey, onConversationSelect} = homeState;

  return (
    <Layout>
      <Conversations
        selectedKey={selectedKey}
        onConversationSelect={onConversationSelect}
      />
      <Conversation selectedKey={selectedKey} />
    </Layout>
  );
};
