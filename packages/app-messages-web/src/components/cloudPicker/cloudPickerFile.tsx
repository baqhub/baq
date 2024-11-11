import {Handler} from "@baqhub/sdk";
import {ButtonRow, Text} from "@baqhub/ui/core/style.js";
import {PhotoIcon} from "@heroicons/react/24/outline";
import {FC} from "react";
import tiwi from "tiwi";
import {FileVersionHash} from "../../baq/fileRecord.js";
import {useCloudPickerFileState} from "../../state/cloudPicker/cloudPickerFileState.js";

//
// Props.
//

interface CloudPickerFileProps {
  fileVersion: FileVersionHash;
  isSelected: boolean;
  onClick: Handler;
}

//
// Style.
//

const LayoutButton = tiwi(ButtonRow)`
  p-2
  gap-1.5
  items-center

  rounded-lg
  hover:bg-neutral-100
  active:bg-neutral-200
`;

const selectedStyle = `
  bg-neutral-200
  hover:bg-neutral-200
`;

const Icon = tiwi.div`
  shrink-0
  w-6
  h-6
  text-neutral-900
`;

const Label = tiwi(Text)`
  text-md
  truncate
`;

//
// Component.
//

export const CloudPickerFile: FC<CloudPickerFileProps> = props => {
  const {fileVersion, isSelected, onClick} = props;
  const {name} = useCloudPickerFileState(fileVersion);

  return (
    <LayoutButton
      role="button"
      onClick={onClick}
      className={isSelected ? selectedStyle : ""}
    >
      <Icon>
        <PhotoIcon />
      </Icon>
      <Label>{name}</Label>
    </LayoutButton>
  );
};
