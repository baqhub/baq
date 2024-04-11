import last from "lodash/last.js";
import without from "lodash/without.js";
import {FC, PropsWithChildren, useCallback, useMemo, useState} from "react";
import {Grid} from "../core/style.js";
import {LayerContext, LayerContextProvider} from "./layerContext.js";

//
// Component.
//

export const LayerManager: FC<PropsWithChildren> = ({children}) => {
  const [layerIds, setLayerIds] = useState<ReadonlyArray<number>>([]);

  const registerLayer = useCallback((layerId: number) => {
    setLayerIds(value => [...value, layerId]);
    return () => {
      setLayerIds(value => without(value, layerId));
    };
  }, []);

  const hasLayer = layerIds.length > 0;
  const topLayerId = last(layerIds);

  const context = useMemo<LayerContext>(
    () => ({topLayerId, registerLayer}),
    [topLayerId, registerLayer]
  );

  return (
    <Grid
      inert={hasLayer ? "" : undefined}
      className={hasLayer ? "no-scrollbars" : undefined}
    >
      <LayerContextProvider value={context}>{children}</LayerContextProvider>
    </Grid>
  );
};
