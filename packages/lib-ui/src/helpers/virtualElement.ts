import {MouseEvent} from "react";

export function mouseVirtualElement({pageX, pageY}: MouseEvent) {
  function generateGetBoundingClientRect(x = 0, y = 0) {
    return (): DOMRect => ({
      width: 0,
      height: 0,
      top: y,
      right: x,
      bottom: y,
      left: x,
      x,
      y,
      toJSON: () => "",
    });
  }

  return {
    getBoundingClientRect: generateGetBoundingClientRect(pageX, pageY),
  };
}
