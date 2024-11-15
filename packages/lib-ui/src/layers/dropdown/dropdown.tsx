import {Handler} from "@baqhub/sdk";
import {
  CSSProperties,
  KeyboardEvent,
  PropsWithChildren,
  forwardRef,
} from "react";
import tiwi from "tiwi";
import {Column} from "../../core/style.js";

//
// Props.
//

interface DropdownProps extends PropsWithChildren {
  style: CSSProperties;
  getProps: () => Record<string, unknown>;
  onRequestClose: Handler;
}

//
// Style.
//

const Layout = tiwi(Column)`
  p-1.5

  bg-white
  rounded-lg
  drop-shadow-lg
`;

//
// Component.
//

export const Dropdown = forwardRef<HTMLDivElement, DropdownProps>(
  (props, ref) => {
    const {style, getProps, onRequestClose, children} = props;

    const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key !== "Escape") {
        return;
      }

      event.preventDefault();
      onRequestClose();
    };

    return (
      <Layout ref={ref} style={style} {...getProps()} onKeyDown={onKeyDown}>
        {children}
      </Layout>
    );
  }
);
