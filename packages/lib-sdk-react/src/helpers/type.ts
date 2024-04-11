import {ReactNode} from "react";

export type Renderer = () => ReactNode;
export type RendererOf<T> = (arg: T) => ReactNode;

export type DataProvider<T> = () => T;
