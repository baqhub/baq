import {Handler, HandlerOf} from "@baqhub/sdk";
import {FC, useCallback, useEffect, useRef, useState} from "react";
import {EnterKeyHintTypeOptions, TextInput} from "react-native";
import {amber} from "tailwindcss/colors";
import {Row, tw} from "../../helpers/style";

//
// Props.
//

interface TextBoxProps {
  autoFocus?: boolean;
  placeholder?: string;
  isDisabled?: boolean;
  defaultValue?: string;
  enterKeyHint?: EnterKeyHintTypeOptions;
  onFocus?: Handler;
  onBlur?: Handler;
  onChange: HandlerOf<string>;
  onSubmit?: Handler;
}

//
// Style.
//

const Layout = tw(Row)`
  flex-1
`;

const HiddenInput = tw(TextInput)`
  w-0
  h-0
  opacity-0
`;

const Input = tw(TextInput)`
  flex-1
  px-4
  pb-[2px]
  h-[50px]

  rounded-xl
  border
  border-neutral-200
  focus:border-amber-400
  dark:border-neutral-700
  dark:focus:border-amber-600

  text-neutral-900
  dark:text-white
  text-base
  leading-[21px]

  ${{
    isDisabled: `
      bg-neutral-100
      dark:bg-neutral-800

      border-neutral-300
      dark:border-neutral-600

      text-neutral-500
      dark:text-neutral-400
    `,
  }}
`;

//
// Component.
//

export const TextBox: FC<TextBoxProps> = props => {
  const {autoFocus, placeholder, isDisabled} = props;
  const {defaultValue, enterKeyHint} = props;
  const {onFocus, onBlur, onChange, onSubmit} = props;

  const [localIsDisabled, setLocalIsDisabled] = useState(isDisabled);
  const hiddenInputRef = useRef<TextInput>(null);
  const inputRef = useRef<TextInput>(null);

  const hasFocusRef = useRef(false);
  const hadFocusRef = useRef(false);

  useEffect(() => {
    if (localIsDisabled === isDisabled) {
      return;
    }

    if (isDisabled && hasFocusRef.current) {
      hiddenInputRef.current?.focus();
      hadFocusRef.current = hasFocusRef.current;
    } else if (!isDisabled && hadFocusRef.current) {
      inputRef.current?.focus();
    }

    setLocalIsDisabled(isDisabled);
  }, [localIsDisabled, isDisabled]);

  const onInputFocus = useCallback(() => {
    hasFocusRef.current = true;
    onFocus?.();
  }, [onFocus]);

  const onInputBlur = useCallback(() => {
    hasFocusRef.current = false;
    onBlur?.();
  }, [onBlur]);

  return (
    <Layout>
      <HiddenInput
        ref={hiddenInputRef}
        enablesReturnKeyAutomatically
        enterKeyHint={enterKeyHint}
        autoCapitalize="none"
        autoComplete="off"
        autoCorrect={false}
        spellCheck={false}
        keyboardType="url"
        textContentType="URL"
      />
      <Input
        ref={inputRef}
        variants={{isDisabled}}
        autoFocus={autoFocus}
        placeholder={placeholder}
        selectionColor={amber[500]}
        defaultValue={defaultValue}
        editable={!isDisabled || !localIsDisabled}
        onFocus={onInputFocus}
        onBlur={onInputBlur}
        onChangeText={onChange}
        onSubmitEditing={onSubmit}
        blurOnSubmit={false}
        enablesReturnKeyAutomatically
        enterKeyHint={enterKeyHint}
        autoCapitalize="none"
        autoComplete="off"
        autoCorrect={false}
        spellCheck={false}
        keyboardType="url"
        textContentType="URL"
      />
    </Layout>
  );
};
