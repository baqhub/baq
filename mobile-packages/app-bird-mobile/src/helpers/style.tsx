import {useDeepMemo} from "@baqhub/sdk-react";
import isString from "lodash/isString";
import {cssInterop} from "nativewind";
import {
  Children,
  ComponentProps,
  ComponentType,
  FC,
  PropsWithChildren,
  cloneElement,
  forwardRef,
  isValidElement,
  useMemo,
} from "react";
import {Text as RNText, View} from "react-native";
import {SvgProps} from "react-native-svg";
import {twMerge} from "tailwind-merge";

//
// Styled components.
//

const defaultVariant = "default_variant";

interface TWProps {
  className?: string;
}

type TWVariantsMap<T extends string> = {
  [K in T | typeof defaultVariant]?: boolean;
};

interface TWComponentProps<T extends string> {
  variants?: T | TWVariantsMap<T> | false | null;
}

type TWVariants<T extends string> = {
  [K in T]?: string;
};

function normalize(classNames: ReadonlyArray<string | undefined>) {
  return twMerge(...classNames);
}

export function tw<C extends ComponentType<TWProps>>(Component: C) {
  return <T extends string>(
    classNames: TemplateStringsArray,
    ...args: TWVariants<T>[]
  ) => {
    type Props = ComponentProps<C>;
    type RefType = C extends abstract new (...args: any) => any ? C : never;

    return forwardRef<InstanceType<RefType>, Props & TWComponentProps<T>>(
      (props, ref) => {
        const {className, variants, ...otherProps} = props;

        const requestedVariants = useDeepMemo<ReadonlySet<string>>(() => {
          if (!variants) {
            return new Set();
          }

          if (!isString(variants)) {
            return new Set(
              Object.keys(variants)
                .map(k => k as T)
                .filter(k => variants[k] === true)
            );
          }

          return new Set([variants]);
        }, [variants]);

        const mergedClassName = useMemo(() => {
          const allClassNames = classNames.reduce((list, current, index) => {
            const variantValues = args[index - 1];

            if (variantValues) {
              Object.keys(variantValues)
                .filter(v => requestedVariants.has(v))
                .forEach(v => {
                  const variantValue = variantValues[v as T];
                  if (!variantValue) {
                    return;
                  }

                  list.push(variantValue);
                });
            }

            list.push(current);
            return list;
          }, [] as string[]);

          return normalize([...allClassNames, className]);
          // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [classNames, args, className, requestedVariants]);

        const AnyComponent = Component as any;
        return (
          <AnyComponent {...otherProps} ref={ref} className={mergedClassName} />
        );
      }
    );
  };
}

//
// Images.
//

// cssInterop(Image, {
//   className: {
//     target: "style",
//   },
// });

//
// Heroicons.
//

const IconBase: FC<SvgProps & PropsWithChildren> = props => {
  const {children, ...svgProps} = props;
  return Children.map(children, icon => {
    if (!isValidElement(icon)) {
      return null;
    }

    return cloneElement(icon, {...svgProps, ...icon.props});
  });
};

cssInterop(IconBase, {
  className: {
    target: "style",
    nativeStyleToProp: {
      width: "width",
      height: "height",
      color: "color",
      borderWidth: "strokeWidth",
    },
  },
});

export const Icon = tw(IconBase)`
  text-neutral-900
  dark:text-white
`;

//
// Shared style.
//

export const Column = View;

export const Row = tw(View)`
  flex-row
`;

export const Text = tw(RNText)`
  text-neutral-950
  dark:text-white
`;

export const Centered = tw(View)`
  flex-1
  items-center
  justify-center
`;
