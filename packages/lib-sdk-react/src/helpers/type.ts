import {ReactNode} from "react";

export type Renderer = () => ReactNode | Promise<ReactNode>;
export type RendererOf<T> = (arg: T) => ReactNode | Promise<ReactNode>;

export type DataProvider<T> = () => T;
