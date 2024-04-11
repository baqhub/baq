import {Handler} from "@baqhub/sdk";
import {FC, PropsWithChildren, useEffect, useRef} from "react";
import {makeVariants} from "../helpers/type.js";
import {ButtonRow, UISize, classForSize, tw} from "./style.js";

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

const Box = tw(ButtonRow)`
  items-center
  justify-center
  px-3
  pt-2
  pb-1.5
  [&.size-lg]:px-4
  [&.size-lg]:py-2

  disabled:opacity-90
  bg-neutral-100
  enabled:any-hover:hover:bg-neutral-200
  dark:bg-neutral-800
  dark:enabled:any-hover:hover:bg-neutral-700

  rounded-lg
  border-b-2
  enabled:active:border-b
  enabled:active:border-t
  enabled:active:border-transparent
  enabled:any-hover:active:border-transparent
  dark:enabled:active:border-transparent
  dark:enabled:any-hover:active:border-transparent
  border-neutral-200
  enabled:any-hover:hover:border-neutral-300
  focus-visible:border-neutral-300
  dark:border-neutral-700
  dark:enabled:any-hover:hover:border-neutral-600
  dark:focus-visible:border-neutral-600

  text-sm
  text-neutral-900
  disabled:text-opacity-60
  dark:text-white
  dark:disabled:text-opacity-80
`;

const variants = makeVariants<ButtonVariant>()({
  normal: Box,
  primary: tw(Box)`
    disabled:opacity-80
    bg-amber-300
    border-amber-400
    enabled:any-hover:hover:bg-amber-400
    enabled:any-hover:hover:border-amber-500
    focus-visible:border-amber-500
    dark:bg-amber-600
    dark:border-amber-500
    dark:enabled:any-hover:hover:bg-amber-500
    dark:enabled:any-hover:hover:border-amber-400
    dark:focus-visible:border-amber-400
  `,
});

//
// Component.
//

export const Button: FC<ButtonProps> = props => {
  const {size, variant, shouldAutofocus, isDisabled, onClick, children} = props;
  const Component = variants[variant || "normal"];
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
    <Component
      ref={componentRef}
      className={classForSize(size)}
      type="button"
      disabled={isDisabled}
      onClick={onClick}
    >
      {children}
    </Component>
  );
};

export const SubmitButton: FC<ButtonBaseProps> = props => {
  const {size, variant, shouldAutofocus, isDisabled, children} = props;
  const Component = variants[variant || "normal"];
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
    <Component
      ref={componentRef}
      className={classForSize(size)}
      type="submit"
      disabled={isDisabled}
    >
      {children}
    </Component>
  );
};
