declare module "*.mdx" {
  import {ComponentType, ReactNode} from "react";

  export interface MDXProps {
    toc?: ReactNode;
    pages?: ReactNode;
    properties: ComponentType;
    code: ComponentType;
    pill: ComponentType;
    compactList: ComponentType;
    components?: MDXComponents;
  }

  /**
   * An function component which renders the MDX content using JSX.
   *
   * @param props This value is be available as the named variable `props` inside the MDX component.
   * @returns A JSX element. The meaning of this may depend on the project configuration. I.e. it
   * could be a React, Preact, or Vuex element.
   */
  export default function MDXContent(props: MDXProps): JSX.Element;

  export interface Metadata {
    id: string;
    title: string;
    summary?: string;
  }

  export const metadata: Metadata;
}
