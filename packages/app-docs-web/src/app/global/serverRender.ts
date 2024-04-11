import {ReactElement} from "react";
import {renderToStaticMarkup} from "react-dom/server.node";

let isRendering = false;

export function isServerRendering() {
  return isRendering;
}

export function serverRender(element: ReactElement) {
  isRendering = true;
  const result = renderToStaticMarkup(element as any);
  isRendering = false;
  return result;
}
