import {cssInterop} from "nativewind";
import {
  Children,
  cloneElement,
  FC,
  isValidElement,
  PropsWithChildren,
} from "react";
import {Text as RNText, View} from "react-native";
import {SvgProps} from "react-native-svg";
import tiwi from "tiwi";

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

export const Icon = tiwi(IconBase)`
  text-neutral-900
  dark:text-white
`;

//
// Shared style.
//

export const Column = View;

export const Row = tiwi(View)`
  flex-row
`;

export const Text = tiwi(RNText)`
  text-neutral-950
  dark:text-white
`;

export const Centered = tiwi(View)`
  flex-1
  items-center
  justify-center
`;
