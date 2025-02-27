import {ComponentProps, FC, useLayoutEffect, useRef} from "react";
import {Text} from "./style.js";

export const ShrinkWrapText: FC<ComponentProps<typeof Text>> = props => {
  const textRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const currentText = textRef.current;
    if (!currentText) {
      return;
    }

    const {firstChild, lastChild} = currentText;
    if (!firstChild || !lastChild) {
      return;
    }

    const range = document.createRange();
    range.setStartBefore(firstChild);
    range.setEndAfter(lastChild);

    const {width} = range.getBoundingClientRect();
    currentText.style.width = width + "px";

    return () => {
      currentText.style.width = "";
    };
  }, []);

  return <Text ref={textRef} {...props} />;
};
