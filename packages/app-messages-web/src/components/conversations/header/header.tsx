import {IconButton} from "@baqhub/ui/core/iconButton.js";
import {Row, Text, tw} from "@baqhub/ui/core/style.js";
import {PencilSquareIcon} from "@heroicons/react/20/solid";
import {FC, Suspense} from "react";
import {useConversationsHeaderState} from "../../../state/conversationsHeaderState.js";
import {ConversationSelectHandler} from "../../../state/homeState.js";
import {useUnknownConversationsState} from "../../../state/unknownConversationsState.js";
import {ComposerDialog} from "../../composer/composerDialog.js";
import {HeaderUnknownButton} from "./headerUnknownButton.js";
import {UnknownConversationsDialog} from "./unknownConversationsDialog.js";

//
// Props.
//

interface HeaderProps {
  onConversationSelect: ConversationSelectHandler;
}

//
// Style.
//

const Layout = tw(Row)`
  px-6
  pt-6
  items-end
  gap-1
`;

const Title = tw(Text)`
  grow
  pl-2
  text-2xl
  font-semibold
`;

//
// Component.
//

export const Header: FC<HeaderProps> = props => {
  const {onConversationSelect} = props;

  const unknownState = useUnknownConversationsState();
  const {isUnknownListOpen, getUnknownCount, getUnknownItemKeys} = unknownState;
  const {onUnknownListRequest, onUnknownListRequestClose} = unknownState;

  const state = useConversationsHeaderState();
  const {isComposerOpen, onComposerRequest, onComposerRequestClose} = state;

  return (
    <Layout>
      <Title>Messages</Title>
      <Suspense>
        <HeaderUnknownButton
          getCount={getUnknownCount}
          onClick={onUnknownListRequest}
        />
      </Suspense>
      <IconButton onClick={onComposerRequest}>
        <PencilSquareIcon />
      </IconButton>

      {isUnknownListOpen && (
        <UnknownConversationsDialog
          getItemKeys={getUnknownItemKeys}
          onRequestClose={onUnknownListRequestClose}
        />
      )}

      {isComposerOpen && (
        <ComposerDialog
          onConversationSelect={onConversationSelect}
          onRequestClose={onComposerRequestClose}
        />
      )}
    </Layout>
  );
};
