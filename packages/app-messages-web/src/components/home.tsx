import {Grid, tw} from "@baqhub/ui/core/style.js";
import {FC} from "react";
import {useHomeState} from "../state/homeState.js";
import {ComposerDialog} from "./composer/composerDialog.js";
import {Conversation} from "./conversation/conversation.js";
import {Conversations} from "./conversations/conversations.js";

//
// Style.
//

const Layout = tw(Grid)`
  grid-cols-[16rem_1fr]
  grid-flow-col
`;

//
// Component.
//

export const Home: FC = () => {
  const homeState = useHomeState();
  const {selectedKey, isComposerOpen, onConversationSelect} = homeState;
  const {onComposerRequest, onComposerRequestClose} = homeState;

  return (
    <Layout>
      <Conversations
        selectedKey={selectedKey}
        onComposeClick={onComposerRequest}
        onConversationSelect={onConversationSelect}
      />
      <Conversation selectedKey={selectedKey} />
      {isComposerOpen && (
        <ComposerDialog
          onConversationSelect={onConversationSelect}
          onRequestClose={onComposerRequestClose}
        />
      )}
    </Layout>
  );
};
