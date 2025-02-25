import {Handler} from "@baqhub/sdk";
import {FC, PropsWithChildren, useEffect, useRef} from "react";
import tiwi from "tiwi";
import {ButtonRow, UISize} from "./style.js";

//
// Props.
//

type ButtonVariant = "normal" | "primary";

interface ButtonBaseProps extends PropsWithChildren {
  size?: UISize;
  variant?: ButtonVariant;
  shouldAutofocus?: boolean;
  isDisabled?: boolean;
}

interface ButtonProps extends ButtonBaseProps {
  onClick: Handler;
}

//
// Style.
//

const StyledButton = tiwi(ButtonRow)<UISize | ButtonVariant>`
  items-center
  justify-center
  px-3
  pt-2
  pb-1.5

  ${{
    large: `
      px-4
      py-2
    `,
  }}

  disabled:opacity-90
  bg-neutral-100
  enabled:hover:bg-neutral-200
  dark:bg-neutral-800
  dark:enabled:hover:bg-neutral-700

  rounded-lg
  border-b-2
  enabled:active:border-b
  enabled:active:border-t
  enabled:active:border-transparent
  dark:enabled:active:border-transparent
  border-neutral-200
  enabled:hover:border-neutral-300
  focus-visible:border-neutral-300
  dark:border-neutral-700
  dark:enabled:hover:border-neutral-600
  dark:focus-visible:border-neutral-600

  text-sm
  text-neutral-900
  disabled:text-opacity-60
  dark:text-white
  dark:disabled:text-opacity-80

  ${{
    primary: `
      disabled:opacity-80
      bg-amber-300
      border-amber-400
      enabled:hover:bg-amber-400
      enabled:hover:border-amber-500
      focus-visible:border-amber-500
      dark:bg-amber-600
      dark:border-amber-500
      dark:enabled:hover:bg-amber-500
      dark:enabled:hover:border-amber-400
      dark:focus-visible:border-amber-400
    `,
  }}
`;

//
// Component.
//

export const Button: FC<ButtonProps> = props => {
  const {size, variant, shouldAutofocus, isDisabled, onClick, children} = props;
  const componentRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const currentComponent = componentRef.current;
    if (!shouldAutofocus || !currentComponent) {
      return;
    }

    // Hack until React fixes autoFocus in <dialog>.
    setTimeout(() => {
      currentComponent.focus();
    });
  }, [shouldAutofocus]);

  return (
    <StyledButton
      ref={componentRef}
      variants={[size, variant]}
      type="button"
      disabled={isDisabled}
      onClick={onClick}
    >
      {children}
    </StyledButton>
  );
};

export const SubmitButton: FC<ButtonBaseProps> = props => {
  const {size, variant, shouldAutofocus, isDisabled, children} = props;
  const componentRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const currentComponent = componentRef.current;
    if (!shouldAutofocus || !currentComponent) {
      return;
    }

    // Hack until React fixes autoFocus in <dialog>.
    setTimeout(() => {
      currentComponent.focus();
    });
  }, [shouldAutofocus]);

  return (
    <StyledButton
      ref={componentRef}
      variants={[size, variant]}
      type="submit"
      disabled={isDisabled}
    >
      {children}
    </StyledButton>
  );
};
