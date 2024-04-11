import {Handler} from "@baqhub/sdk";
import {FC, PropsWithChildren} from "react";
import {ButtonRow, Text, tw} from "../../core/style.js";
import {useDropdownContext} from "./dropdownContext.js";

//
// Props.
//

interface DropdownItemProps extends PropsWithChildren {
  onClick: Handler;
}

//
// Style.
//

const Layout = tw(ButtonRow)`
  group/item
  px-3
  py-1.5

  rounded-lg
  hover:bg-amber-500
  active:bg-amber-600
`;

const Label = tw(Text)`
  group-hover/item:text-white
`;

//
// Component.
//

export const DropdownItem: FC<DropdownItemProps> = props => {
  const {onClick, children} = props;
  const {onItemClick} = useDropdownContext();

  const onLayoutClick = () => {
    onItemClick();
    onClick();
  };

  return (
    <Layout role="button" onClick={onLayoutClick}>
      <Label>{children}</Label>
    </Layout>
  );
};
