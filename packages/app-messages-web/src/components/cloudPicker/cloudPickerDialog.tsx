import {Handler, HandlerOf} from "@baqhub/sdk";
import {DataProvider} from "@baqhub/sdk-react";
import {Button} from "@baqhub/ui/core/button.js";
import {ButtonGroup} from "@baqhub/ui/core/buttonGroup.js";
import {Column} from "@baqhub/ui/core/style.js";
import {Dialog} from "@baqhub/ui/layers/dialog/dialog.js";
import {FC, Suspense} from "react";
import tiwi from "tiwi";
import {FileVersionHash} from "../../baq/fileRecord.js";
import {
  FilePickHandler,
  useCloudPickerState,
} from "../../state/cloudPicker/cloudPickerDialogState.js";
import {CloudPickerEmpty} from "./cloudPickerEmpty.js";
import {CloudPickerFile} from "./cloudPickerFile.js";
import {CloudPickerLoading} from "./cloudPickerLoading.js";

//
// Props.
//

interface CloudPickerDialogProps {
  onFilePick: FilePickHandler;
  onRequestClose: Handler;
}

//
// Style.
//

const Layout = tiwi(Column)`
  w-96
  gap-3
`;

const FileList = tiwi(Column)`
  pb-3
  h-60
  gap-1
  overflow-auto
`;

//
// Component.
//

export const CloudPickerDialog: FC<CloudPickerDialogProps> = props => {
  const {onFilePick, onRequestClose} = props;
  const cloudPickerState = useCloudPickerState(onFilePick, onRequestClose);
  const {getFileVersions, selectedVersion} = cloudPickerState;
  const {onFileClick, onContinueClick} = cloudPickerState;

  return (
    <Dialog onRequestClose={onRequestClose}>
      <Layout>
        <FileList>
          <Suspense fallback={<CloudPickerLoading />}>
            <CloudPickerFiles
              getFileVersions={getFileVersions}
              selectedVersion={selectedVersion}
              onFileClick={onFileClick}
            />
          </Suspense>
        </FileList>
        <ButtonGroup align="end">
          <Button size="large" onClick={onRequestClose}>
            Cancel
          </Button>
          <Button
            size="large"
            variant="primary"
            isDisabled={!selectedVersion}
            onClick={onContinueClick}
          >
            Continue
          </Button>
        </ButtonGroup>
      </Layout>
    </Dialog>
  );
};

interface CloudPickerFilesProps {
  getFileVersions: DataProvider<ReadonlyArray<FileVersionHash>>;
  selectedVersion: FileVersionHash | undefined;
  onFileClick: HandlerOf<FileVersionHash>;
}

const CloudPickerFiles: FC<CloudPickerFilesProps> = props => {
  const {getFileVersions, selectedVersion, onFileClick} = props;
  const fileVersions = getFileVersions();

  if (fileVersions.length === 0) {
    return <CloudPickerEmpty />;
  }

  return (
    <>
      {fileVersions.map(version => (
        <CloudPickerFile
          key={version}
          fileVersion={version}
          isSelected={version === selectedVersion}
          onClick={() => onFileClick(version)}
        />
      ))}
    </>
  );
};
