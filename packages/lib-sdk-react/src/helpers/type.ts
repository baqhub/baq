import {ReactNode} from "react";

export interface FC<P = Record<string, never>> {
  (props: P): ReactNode;
  displayName?: string | undefined;
}

export type Renderer = () => ReactNode;
export type RendererOf<T> = (arg: T) => ReactNode;

export type DataProvider<T> = () => T;
