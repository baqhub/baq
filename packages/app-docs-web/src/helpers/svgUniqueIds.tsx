"use client";

import {
  cloneElement,
  isValidElement,
  memo,
  PropsWithChildren,
  useId,
} from "react";
import {deepMap} from "react-children-utilities";

// Adapted from:
// https://github.com/elderapo/react-svg-unique-id

export const SvgUniqueIds = memo<PropsWithChildren>(({children}) => {
  const svgId = useId();

  const fixId = (id: string | undefined) => {
    if (!id) {
      return undefined;
    }

    return `svg_${svgId}_${id}`;
  };

  const fixUrlProp = (prop: unknown) => {
    if (typeof prop !== "string") {
      return prop;
    }

    const [_, id] = prop.match(/^url\(#(.*)\)$/) || [null, null];
    if (!id) {
      return prop;
    }

    const fixedId = fixId(id);
    if (!fixedId) {
      return prop;
    }

    return `url(#${fixedId})`;
  };

  const fixXlinkHref = (prop: unknown) => {
    if (typeof prop !== "string" || !prop.startsWith("#")) {
      return prop;
    }

    const fixedId = fixId(prop.slice(1));
    if (!fixedId) {
      return prop;
    }

    return `#${fixedId}`;
  };

  return deepMap(children, child => {
    if (!isValidElement<Record<string, any>>(child)) {
      return child;
    }

    const newProps = Object.keys(child.props).reduce(
      (result, key) => {
        result[key] = fixUrlProp(child.props[key]);
        return result;
      },
      {} as Record<string, unknown>
    );

    return cloneElement(child, {
      ...newProps,
      id: fixId(child.props.id),
      xlinkHref: fixXlinkHref(child.props.xlinkHref),
    });
  });
});
