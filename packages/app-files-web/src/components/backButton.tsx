import {Handler} from "@baqhub/sdk";
import {tw} from "@baqhub/ui/core/style.js";
import {FC} from "react";

/*
 * Props.
 */

interface BackButtonProps {
  onClick: Handler;
}

/*
 * Style.
 */

const StyledItem = tw.div`
  p-1
`;

/*
 * Component.
 */

export const BackButton: FC<BackButtonProps> = ({onClick}) => {
  return (
    <StyledItem>
      <button type="button" onClick={onClick}>
        Back
      </button>
    </StyledItem>
  );
};
