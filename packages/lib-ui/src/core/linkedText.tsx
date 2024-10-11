import {RendererOf} from "@baqhub/sdk-react";
import {IntermediateRepresentation, Options, tokenize} from "linkifyjs";
import {
  Children,
  cloneElement,
  createElement,
  FC,
  Fragment,
  isValidElement,
  PropsWithChildren,
  ReactElement,
  ReactNode,
  useCallback,
} from "react";

//
// Props.
//

export interface LinkProps {
  href: string;
  children: string;
}

interface LinkedTextProps extends PropsWithChildren {
  newLineToBr?: boolean;
  renderText?: RendererOf<string>;
  renderLink: RendererOf<LinkProps>;
}

//
// Component.
//

interface LinkedTextParams {
  elementId: number;
  renderText: RendererOf<string>;
}

function findElementKey(meta: LinkedTextParams) {
  return `__linked-${meta.elementId++}`;
}

function stringToElements(
  source: string,
  options: Options,
  params: LinkedTextParams
) {
  const tokens = tokenize(source);
  const elements: ReactNode[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]!;

    if (token.t === "nl" && options.get("nl2br")) {
      const key = findElementKey(params);
      elements.push(createElement("br", {key}));
    } else if (!token.isLink || !options.check(token)) {
      const rendered = params.renderText(token.toString());

      if (typeof rendered === "string") {
        elements.push(rendered);
      } else if (isValidElement(rendered)) {
        const key = findElementKey(params);
        const props = {key, ...rendered.props};
        elements.push(cloneElement(rendered, props));
      }
    } else {
      const rendered = options.render(token);
      const key = findElementKey(params);
      const props = {key, ...rendered.props};
      elements.push(cloneElement(rendered, props));
    }
  }

  return elements;
}

function linkifyElement(
  element: ReactElement,
  options: Options,
  params: LinkedTextParams
) {
  if (Children.count(element.props.children) === 0) {
    return element;
  }

  const children: ReactNode[] = [];

  Children.forEach(element.props.children, child => {
    if (typeof child === "string") {
      children.push(stringToElements(child, options, params));
    } else if (isValidElement(child)) {
      children.push(linkifyElement(child, options, params));
    } else {
      children.push(child);
    }
  });

  const key = findElementKey(params);
  const newProps = {key, ...element.props};
  return cloneElement(element, newProps, children);
}

export const LinkedText: FC<LinkedTextProps> = props => {
  const {newLineToBr, renderText, renderLink, children} = props;

  const render = useCallback(
    (token: IntermediateRepresentation) => {
      return renderLink({
        href: token.attributes["href"]!,
        children: token.content,
      });
    },
    [renderLink]
  );

  const options = new Options({
    render,
    nl2br: newLineToBr !== false,
    truncate: 20,
  });

  const params: LinkedTextParams = {
    elementId: 0,
    renderText: renderText || ((str: string) => str),
  };

  const element = createElement(Fragment, {}, children);
  return linkifyElement(element, options, params);
};
