import {Handler} from "@baqhub/sdk";
import {FC, PropsWithChildren} from "react";
import {Pressable, View} from "react-native";
import {Text, tw} from "../../helpers/style";

//
// Props.
//

type ButtonVariant = "normal" | "primary";

interface ButtonProps extends PropsWithChildren {
  variant?: ButtonVariant;
  isDisabled?: boolean;
  isFeatured?: boolean;
  onPress: Handler;
}

//
// Style.
//

const ButtonPressable = tw(Pressable)`
  group
  pb-[3px]
  active:pb-0
  rounded-xl

  opacity-100
  bg-neutral-200
  dark:bg-neutral-700

  shadow-none
  shadow-amber-500/50

  ${{
    isPrimary: `
      bg-amber-400
      dark:bg-amber-500
    `,
    isDisabled: `
      opacity-50
    `,
    isFeatured: `
      shadow-md
    `,
  }}
`;

const Content = tw(View)<ButtonVariant>`
  px-4
  py-[12.5px]
  group-active:py-[14px]

  rounded-xl
  bg-neutral-100
  dark:bg-neutral-800

  ${{
    primary: `
      bg-amber-300
      dark:bg-amber-600
    `,
  }}
`;

const ButtonText = tw(Text)`
  text-center
  text-base
  font-medium
  text-neutral-700
  dark:text-neutral-200
`;

//
// Component.
//

export const Button: FC<ButtonProps> = props => {
  const {variant, isDisabled, isFeatured} = props;
  const {onPress, children} = props;

  return (
    <ButtonPressable
      variants={{
        isPrimary: variant === "primary",
        isDisabled,
        isFeatured,
      }}
      disabled={isDisabled}
      onPress={onPress}
    >
      <Content variants={variant}>
        <ButtonText>{children}</ButtonText>
      </Content>
    </ButtonPressable>
  );
};
