import {usePostComposerState} from "@baqhub/bird-shared/state/postComposerState.js";
import {useConstant} from "@baqhub/sdk-react";
import {Button} from "@baqhub/ui/core/button.js";
import {Column, Grid} from "@baqhub/ui/core/style.js";
import {FC, KeyboardEvent, useEffect, useRef} from "react";
import tiwi from "tiwi";
import {Avatar} from "../../shared/avatar.js";

//
// Props.
//

interface PostComposerProps {
  mention: string | undefined;
}

//
// Style.
//

const Layout = tiwi(Grid)`
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

const AvatarCell = tiwi.div`
  col-start-1
`;

const Textarea = tiwi.textarea`
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

const Sizer = tiwi.div`
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

const Placeholder = tiwi.div`
  col-start-2
  row-start-1

  p-1.5
  select-none
  pointer-events-none

  truncate
  text-neutral-400
  dark:text-neutral-500

  hidden
  peer-placeholder-shown:block
`;

const ButtonCell = tiwi(Column)`
  col-start-3
  justify-end
`;

//
// Component.
//

export const PostComposer: FC<PostComposerProps> = ({mention}) => {
  const state = usePostComposerState({mention});
  const {placeholder, entity, text} = state;
  const {onTextChange, onPostPress} = state;
  const isValidText = Boolean(text.trim());

  const onInputKeyDown = (e: KeyboardEvent) => {
    if ((!e.metaKey && !e.ctrlKey) || e.key !== "Enter") {
      return;
    }

    e.preventDefault();
    onPostPress();
  };

  const shouldFocus = useConstant(() => Boolean(text));
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const currentTextarea = textareaRef.current;
    if (!shouldFocus || !currentTextarea) {
      return;
    }

    currentTextarea.focus();
    currentTextarea.selectionStart = currentTextarea.value.length;
    currentTextarea.selectionEnd = currentTextarea.value.length;
  }, [shouldFocus]);

  return (
    <Layout>
      <AvatarCell>
        <Avatar entity={entity} />
      </AvatarCell>
      <Textarea
        ref={textareaRef}
        placeholder=""
        value={text}
        maxLength={400}
        rows={1}
        onChange={e => onTextChange(e.target.value)}
        onKeyDown={onInputKeyDown}
        required
      />
      <Sizer>{text}&nbsp;</Sizer>
      <Placeholder>{placeholder}</Placeholder>
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
