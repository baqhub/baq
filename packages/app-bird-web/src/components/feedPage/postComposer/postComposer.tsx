import {usePostComposerState} from "@baqhub/bird-shared/state/postComposerState.js";
import {Button} from "@baqhub/ui/core/button.js";
import {Column, Grid, tw} from "@baqhub/ui/core/style.js";
import {FC} from "react";
import {Avatar} from "../../shared/avatar.js";

//
// Style.
//

const Layout = tw(Grid)`
  group
  my-3
  p-3
  gap-3

  grid-cols-[auto_1fr_auto]

  rounded-xl
  ring-1
  ring-inset
  ring-neutral-300
  focus-within:ring-neutral-500
  dark:ring-neutral-700
  dark:focus-within:ring-neutral-500
`;

const AvatarCell = tw.div`
  col-start-1
`;

const Textarea = tw.textarea`
  peer
  col-start-2
  row-start-1
  resize-none

  p-1.5
  text-neutral-900
  dark:text-white

  placeholder:select-none
  placeholder:text-neutral-400
  dark:placeholder:text-neutral-500

  bg-transparent
  outline-none
`;

const Sizer = tw.div`
  col-start-2
  row-start-1

  p-1.5
  whitespace-pre-wrap
  select-none
  pointer-events-none
  invisible

  peer-valid:min-h-[84px]
  group-focus-within:min-h-[84px]
  max-h-[300px]
`;

const ButtonCell = tw(Column)`
  col-start-3
  justify-end
`;

//
// Component.
//

export const PostComposer: FC = () => {
  const state = usePostComposerState();
  const {placeholder, entity, text} = state;
  const {onTextChange, onPostPress} = state;
  const isValidText = Boolean(text.trim());

  return (
    <Layout>
      <AvatarCell>
        <Avatar entity={entity} />
      </AvatarCell>
      <Textarea
        placeholder={placeholder}
        value={text}
        maxLength={400}
        rows={1}
        onChange={e => onTextChange(e.target.value)}
        required
      />
      <Sizer>{text}&nbsp;</Sizer>
      <ButtonCell>
        <Button
          variant="primary"
          onClick={() => onPostPress()}
          isDisabled={!isValidText}
        >
          Post
        </Button>
      </ButtonCell>
    </Layout>
  );
};
