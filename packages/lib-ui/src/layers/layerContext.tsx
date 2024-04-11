import {Handler} from "@baqhub/sdk";
import {createContext, useContext} from "react";

//
// Context.
//

export interface LayerContext {
  topLayerId: number | undefined;
  registerLayer: (layerId: number) => Handler;
}

const LayerContext = createContext<LayerContext>({
  topLayerId: 0,
  registerLayer: () => () => {},
});

//
// Components.
//

export const LayerContextProvider = LayerContext.Provider;

export function useLayerContext() {
  return useContext(LayerContext);
}
