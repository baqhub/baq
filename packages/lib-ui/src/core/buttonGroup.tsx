import {FC, PropsWithChildren} from "react";
import tiwi from "tiwi";

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

const Group = tiwi.div<GroupAlignment>`
  flex
  shrink-0

  justify-start
  ${{
    end: `justify-end`,
  }}
`;

const InlineBlock = tiwi.div`
  inline-block
`;

const Grid = tiwi.div`
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
    <Group variants={align}>
      <InlineBlock>
        <Grid>{children}</Grid>
      </InlineBlock>
    </Group>
  );
};
