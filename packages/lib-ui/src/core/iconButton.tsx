import {Handler} from "@baqhub/sdk";
import {PropsWithChildren, forwardRef} from "react";
import tiwi from "tiwi";
import {ButtonRow, UISize} from "./style.js";

//
// Props.
//

type IconButtonVariant = "normal" | "circle";

interface IconButtonProps extends PropsWithChildren {
  size?: UISize;
  variant?: IconButtonVariant;
  isDisabled?: boolean;
  isPressed?: boolean;
  onClick: Handler;
}

//
// Style.
//

const Layout = tiwi(ButtonRow)<IconButtonVariant>`
  shrink-0
  p-1.5

  disabled:opacity-90
  any-hover:enabled:hover:bg-neutral-900/5
  enabled:active:bg-neutral-900/10
  any-hover:enabled:active:bg-neutral-900/10
  enabled:aria-expanded:bg-neutral-900/10
  any-hover:enabled:aria-expanded:bg-neutral-900/10
  dark:any-hover:enabled:hover:bg-white/5
  dark:enabled:active:bg-white/10
  dark:any-hover:enabled:active:bg-white/10
  dark:enabled:aria-expanded:bg-white/10
  dark:any-hover:enabled:aria-expanded:bg-white/10

  rounded-lg
  ${{
    circle: `rounded-full`,
  }}

  text-neutral-900
  dark:text-white
  disabled:text-opacity-60
`;

const Content = tiwi.div<UISize>`
  size-5
  ${{
    medium: `size-6`,
  }}
`;

//
// Component.
//

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (props, ref) => {
    const {size, variant, isDisabled, isPressed, onClick, children} = props;
    return (
      <Layout
        ref={ref}
        type="button"
        disabled={isDisabled}
        variants={variant}
        aria-expanded={isPressed}
        onClick={onClick}
      >
        <Content variants={size}>{children}</Content>
      </Layout>
    );
  }
);
