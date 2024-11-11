import {HandlerOf} from "@baqhub/sdk";
import {ChangeEvent, FC, PropsWithChildren, useCallback} from "react";
import tiwi from "tiwi";
import Checkmark from "../assets/vector/checkBoxCheckmark.svg?react";
import {Text} from "./style.js";

//
// Props.
//

interface CheckBoxProps extends PropsWithChildren {
  isChecked: boolean;
  isReadonly?: boolean;
  isDisabled?: boolean;
  onChange: HandlerOf<boolean>;
}

//
// Style.
//

const Label = tiwi.label`
  relative
  flex
  items-center
  gap-1.5
`;

const Input = tiwi.input`
  absolute
  h-0
  w-0
  opacity-0
  appearance-none

  peer
`;

const Box = tiwi.div`
  h-4
  w-4

  rounded-[3px]
  border
  border-neutral-400
  dark:border-neutral-500
  peer-focus-visible:border-amber-400
  peer-checked:bg-amber-400
  peer-checked:border-amber-400
  peer-checked:peer-focus-visible:border-amber-600
  peer-disabled:border-neutral-300
  peer-disabled:peer-checked:bg-neutral-300

  dark:peer-focus-visible:border-amber-600
  dark:peer-checked:bg-amber-600
  dark:peer-checked:border-amber-600
  dark:peer-checked:peer-focus-visible:border-amber-400
  dark:peer-disabled:border-neutral-600
  dark:peer-disabled:bg-neutral-600

  text-white
  dark:peer-disabled:text-neutral-400
`;

const Content = tiwi(Text)`
  peer-disabled:text-neutral-400
  dark:peer-disabled:text-neutral-500
`;

//
// Component.
//

export const CheckBox: FC<CheckBoxProps> = props => {
  const {isChecked, isReadonly, isDisabled, onChange, children} = props;

  const onInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (isReadonly || isDisabled) {
        return;
      }

      onChange(e.target.checked);
    },
    [isReadonly, isDisabled, onChange]
  );

  return (
    <Label>
      <Input
        type="checkbox"
        checked={isChecked}
        onChange={onInputChange}
        readOnly={isReadonly}
        disabled={isDisabled}
      />
      <Box>{isChecked && <Checkmark />}</Box>
      <Content>{children}</Content>
    </Label>
  );
};
