import {Handler} from "@baqhub/sdk";
import {PhotoIcon} from "@heroicons/react/24/outline";
import {ButtonRow, Text, tw} from "@baqhub/ui/core/style.js";
import {FC} from "react";
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

const LayoutButton = tw(ButtonRow)`
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

const Icon = tw.div`
  shrink-0
  w-6
  h-6
  text-neutral-900
`;

const Label = tw(Text)`
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
