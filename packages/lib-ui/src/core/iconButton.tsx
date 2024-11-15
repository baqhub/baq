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
  enabled:any-hover:hover:bg-neutral-900/5
  enabled:active:bg-neutral-900/10
  enabled:any-hover:active:bg-neutral-900/10
  enabled:aria-expanded:bg-neutral-900/10
  enabled:any-hover:aria-expanded:bg-neutral-900/10
  dark:enabled:any-hover:hover:bg-white/5
  dark:enabled:active:bg-white/10
  dark:enabled:any-hover:active:bg-white/10
  dark:enabled:aria-expanded:bg-white/10
  dark:enabled:any-hover:aria-expanded:bg-white/10

  rounded-lg
  ${{
    circle: `rounded-full`,
  }}

  text-neutral-900
  dark:text-white
  disabled:text-opacity-60
`;

const Content = tiwi.div<UISize>`
  h-5
  w-5

  ${{
    medium: `
      w-6
      h-6
    `,
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
