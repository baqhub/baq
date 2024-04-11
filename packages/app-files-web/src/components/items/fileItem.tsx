import {
  DocumentIcon,
  FilmIcon,
  GifIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import {FC} from "react";
import {FileRecordKey} from "../../baq/fileRecord.js";
import {useFileItemState} from "../../state/fileItemState.js";
import {ItemBase} from "./itemBase.js";

//
// Props.
//

interface FileItemProps {
  fileKey: FileRecordKey;
}

//
// Component.
//

function renderIconForExtension(extension: string | undefined) {
  switch (extension) {
    case ".jpg":
    case ".jpeg":
    case ".png":
    case ".tiff":
      return <PhotoIcon />;

    case ".gif":
      return <GifIcon />;

    case ".mov":
    case ".mpg":
    case ".mpeg":
    case ".mp4":
    case ".mkv":
      return <FilmIcon />;

    default:
      return <DocumentIcon />;
  }
}

export const FileItem: FC<FileItemProps> = ({fileKey}) => {
  const {name, extension, buildDownloadUrl} = useFileItemState(fileKey);

  const onItemClick = () => {
    const blobUrl = buildDownloadUrl();
    window.open(blobUrl, "_self");
  };

  return (
    <ItemBase
      itemKey={fileKey}
      itemName={name}
      icon={renderIconForExtension(extension)}
      deleteDialogTitle="Delete file"
      onClick={onItemClick}
    >
      {name}
    </ItemBase>
  );
};
