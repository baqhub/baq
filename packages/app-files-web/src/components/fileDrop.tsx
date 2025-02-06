import {Column, Grid, Text} from "@baqhub/ui/core/style.js";
import {DocumentArrowUpIcon} from "@heroicons/react/24/outline";
import find from "lodash/find.js";
import {DragEventHandler, FC, useEffect, useState} from "react";
import tiwi from "tiwi";
import {useNewFileState} from "../state/newFileState.js";

//
// Style.
//

const Layout = tiwi(Grid)`
  absolute
  top-0
  left-0
  h-full
  w-full
  bg-neutral-900
  bg-opacity-20

  hidden
  ${{isDragging: `grid`}}
`;

const Content = tiwi(Column)`
  self-center
  justify-self-center
  pointer-events-none

  p-6
  gap-3
  items-center
  bg-white
  rounded-xl
`;

const Icon = tiwi.div`
  h-8
  w-8
  text-neutral-900
`;

const Label = tiwi(Text)`
  text-xl
`;

/*
 * Component.
 */

export const FileDrop: FC = () => {
  const {onNewFile} = useNewFileState();
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const onDragEnter = () => {
      setIsDragging(true);
    };

    window.addEventListener("dragenter", onDragEnter);
    return () => window.removeEventListener("dragenter", onDragEnter);
  });

  const allowDrag: DragEventHandler = e => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop: DragEventHandler = e => {
    e.preventDefault();
    setIsDragging(false);

    const firstFile = find(e.dataTransfer.files);
    if (!firstFile) {
      return;
    }

    onNewFile(firstFile);
  };

  return (
    <Layout
      variants={{isDragging}}
      onDragEnter={allowDrag}
      onDragOver={allowDrag}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <Content>
        <Icon>
          <DocumentArrowUpIcon />
        </Icon>
        <Label>Drop a file to upload</Label>
      </Content>
    </Layout>
  );
};
