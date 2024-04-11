import {DocumentArrowUpIcon} from "@heroicons/react/24/outline";
import {Column, Grid, Text, tw} from "@baqhub/ui/core/style.js";
import find from "lodash/find.js";
import {DragEventHandler, FC, useEffect, useState} from "react";
import {useFileDropState} from "../state/fileDropState.js";

//
// Style.
//

const Layout = tw(Grid)<{$isDragging: boolean}>`
  absolute
  top-0
  left-0
  h-full
  w-full
  bg-neutral-900
  bg-opacity-20

  ${p => (p.$isDragging ? "" : "hidden")}
`;

const Content = tw(Column)`
  self-center
  justify-self-center
  pointer-events-none

  p-6
  gap-3
  items-center
  bg-white
  rounded-xl
`;

const Icon = tw.div`
  w-8
  h-8
  text-neutral-900
`;

const Label = tw(Text)`
  text-xl
`;

/*
 * Component.
 */

export const FileDrop: FC = () => {
  const {onFileDrop} = useFileDropState();
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

    onFileDrop(firstFile);
  };

  return (
    <Layout
      $isDragging={isDragging}
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
