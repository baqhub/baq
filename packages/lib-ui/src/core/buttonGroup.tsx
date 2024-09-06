import {FC, PropsWithChildren} from "react";
import {tw} from "./style.js";

//
// Props.
//

type GroupAlignment = "start" | "end";

interface ButtonGroupProps extends PropsWithChildren {
  align?: GroupAlignment;
}

//
// Style.
//

const Group = tw.div<{align: GroupAlignment}>`
  shrink-0
  flex
  ${p => (p.align === "start" ? "justify-start" : "justify-end")}
`;

const InlineBlock = tw.div`
  inline-block
`;

const Grid = tw.div`
  grid
  grid-flow-col
  auto-cols-fr
  gap-3
`;

//
// Component.
//

export const ButtonGroup: FC<ButtonGroupProps> = ({align, children}) => {
  return (
    <Group align={align || "start"}>
      <InlineBlock>
        <Grid>{children}</Grid>
      </InlineBlock>
    </Group>
  );
};
