import {Handler} from "@baqhub/sdk";
import {FC} from "react";
import tiwi from "tiwi";

/*
 * Props.
 */

interface BackButtonProps {
  onClick: Handler;
}

/*
 * Style.
 */

const StyledItem = tiwi.div`
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
