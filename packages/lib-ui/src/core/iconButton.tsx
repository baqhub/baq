import {Handler} from "@baqhub/sdk";
import {PropsWithChildren, forwardRef} from "react";
import {makeVariants} from "../helpers/type.js";
import {ButtonRow, UISize, classForSize, tw} from "./style.js";

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

const Layout = tw(ButtonRow)`
  p-1.5

  disabled:opacity-90
  enabled:any-hover:hover:bg-neutral-900/5
  enabled:active:bg-neutral-900/10
  enabled:any-hover:active:bg-neutral-900/10
  enabled:aria-pressed:bg-neutral-900/10
  enabled:any-hover:aria-pressed:bg-neutral-900/10
  dark:enabled:any-hover:hover:bg-white/5
  dark:enabled:active:bg-white/10
  dark:enabled:any-hover:active:bg-white/10
  dark:enabled:aria-pressed:bg-white/10
  dark:enabled:any-hover:aria-pressed:bg-white/10

  text-neutral-900
  dark:text-white
  disabled:text-opacity-60
`;

const NormalLayout = tw(Layout)`
  rounded-lg
`;

const CircleLayout = tw(Layout)`
  rounded-full
`;

const variants = makeVariants<IconButtonVariant>()({
  normal: NormalLayout,
  circle: CircleLayout,
});

const Content = tw.div`
  w-5
  h-5
  [&.size-md]:w-6
  [&.size-md]:h-6
`;

//
// Component.
//

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (props, ref) => {
    const {size, variant, isDisabled, isPressed, onClick, children} = props;
    const Component = variants[variant || "normal"];

    return (
      <Component
        ref={ref}
        type="button"
        disabled={isDisabled}
        aria-pressed={isPressed}
        onClick={onClick}
        className={classForSize(size)}
      >
        <Content className={classForSize(size)}>{children}</Content>
      </Component>
    );
  }
);
