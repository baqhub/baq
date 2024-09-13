import {Handler, HandlerOf, unreachable} from "@baqhub/sdk";
import {useMergeRefs} from "@floating-ui/react";
import {
  ChangeEvent,
  forwardRef,
  InputHTMLAttributes,
  useCallback,
  useEffect,
  useRef,
} from "react";
import {classForSize, tw, UISize} from "./style.js";

//
// Props.
//

type TextBoxVariant = "normal" | "email" | "handle" | "password";

interface TextBoxProps {
  size?: UISize;
  variant?: TextBoxVariant;
  shouldAutofocus?: boolean;
  placeholder?: string;
  maxLength?: number;
  isReadonly?: boolean;
  isDisabled?: boolean;
  isInvalid?: boolean;
  isSelected?: boolean;
  value: string;
  onChange: HandlerOf<string>;
  onFocus?: Handler;
  onBlur?: Handler;
}

//
// Style.
//

const Input = tw.input`
  block
  py-[0.4375rem]
  px-2
  [&.size-lg]:p-3

  bg-neutral-100
  focus:bg-white
  disabled:bg-neutral-200
  aria-invalid:bg-red-500/10
  aria-invalid:focus:bg-red-500/5
  dark:aria-invalid:bg-red-500/10
  dark:aria-invalid:focus:bg-red-500/5
  dark:bg-neutral-800
  dark:focus:bg-neutral-900
  dark:disabled:bg-neutral-700

  rounded-lg
  border
  border-neutral-200
  focus:border-amber-400
  disabled:border-neutral-300
  dark:border-neutral-700
  dark:focus:border-amber-600
  dark:disabled:border-neutral-600
  aria-invalid:border-red-300
  aria-invalid:focus:border-red-400
  dark:aria-invalid:border-red-900
  dark:aria-invalid:focus:border-red-800

  text-sm
  text-neutral-900
  disabled:text-neutral-500
  dark:text-white
  dark:disabled:text-neutral-400
  caret-amber-500
  aria-invalid:caret-red-500
  dark:aria-invalid:caret-red-600

  placeholder:select-none
  placeholder:opacity-40
  aria-invalid:placeholder:opacity-30
  placeholder:text-neutral-500
  aria-invalid:placeholder:text-red-800
  dark:placeholder:text-neutral-400
  dark:aria-invalid:placeholder:text-red-300

  outline-none
  disabled:cursor-not-allowed
`;

//
// Component.
//

function buildVariantProps(
  variant: TextBoxVariant
): InputHTMLAttributes<HTMLInputElement> {
  switch (variant) {
    case "normal":
      return {};

    case "email":
      return {};

    case "handle":
      return {autoComplete: "username", autoCapitalize: "off"};

    case "password":
      return {
        type: "password",
        autoComplete: "current-password",
        autoCapitalize: "off",
      };

    default:
      return unreachable(variant);
  }
}

export const TextBox = forwardRef<HTMLInputElement, TextBoxProps>(
  (props, ref) => {
    const {size, shouldAutofocus, placeholder, maxLength} = props;
    const {isReadonly, isDisabled, isInvalid, isSelected} = props;
    const {value, onChange, onFocus, onBlur} = props;
    const variant = props.variant || "normal";

    const inputRef = useRef<HTMLInputElement>(null);
    const mergedRef = useMergeRefs([ref, inputRef]);

    const onInputChange = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
      },
      [onChange]
    );

    useEffect(() => {
      const currentInput = inputRef.current;
      if (!currentInput || !isSelected) {
        return;
      }

      requestAnimationFrame(() => {
        currentInput.select();
      });
    }, [isSelected]);

    return (
      <Input
        ref={mergedRef}
        type="text"
        autoFocus={shouldAutofocus}
        placeholder={placeholder}
        maxLength={maxLength}
        value={value}
        onChange={onInputChange}
        readOnly={isReadonly}
        disabled={isDisabled}
        aria-invalid={isInvalid}
        onFocus={onFocus}
        onBlur={onBlur}
        className={classForSize(size)}
        {...buildVariantProps(variant)}
      />
    );
  }
);
