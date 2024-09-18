"use client";

import {tw} from "@baqhub/ui/core/style.jsx";
import {CheckIcon, ClipboardIcon} from "@heroicons/react/24/outline";
import {
  FC,
  PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

//
// Style.
//

const Layout = tw.div`
  group
  relative
  mt-3
  mb-5
`;

const Content = tw.div`
  [&_>_pre]:mt-0
  [&_>_pre]:mb-0
`;

const CopyLayout = tw.div`
  hidden
  sm:block

  absolute
  top-[11px]
  right-[11px]

  opacity-0
  group-hover:opacity-100
  transition-opacity
  duration-100
`;

const CopyButton = tw.button`
  block
  p-1.5

  rounded-md
  border

  bg-zinc-800
  border-zinc-500
  text-zinc-200
  dark:bg-zinc-900
  dark:border-zinc-600
  dark:text-zinc-300

  hover:bg-zinc-600
  hover:border-zinc-400
  hover:text-zinc-100
  dark:hover:bg-zinc-700
  dark:hover:border-zinc-500
  dark:hover:text-zinc-200
`;

const CopySuccess = tw.div`
  p-1.5

  rounded-md
  border

  bg-zinc-800
  border-green-500
  text-green-300
  dark:bg-zinc-900
  dark:border-green-700
  dark:text-green-500
`;

const CopyIcon = tw.div`
  w-5
  h-5
`;

//
// Component.
//

export const ClientMdxCopyCode: FC<PropsWithChildren> = ({children}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const lastCopyIdRef = useRef(0);
  const [copyId, setCopyId] = useState<number>();
  const hasJustCopied = Boolean(copyId);

  useEffect(() => {
    if (!copyId) {
      return;
    }

    const timerId = setTimeout(() => {
      setCopyId(undefined);
    }, 3000);

    return () => clearTimeout(timerId);
  }, [copyId]);

  const onCopyButtonClick = useCallback(() => {
    const currentContent = contentRef.current;
    if (!currentContent) {
      return;
    }

    const text = currentContent.textContent;
    if (!text) {
      return;
    }

    navigator.clipboard.writeText(text.trim());

    const newCopyId = ++lastCopyIdRef.current;
    setCopyId(newCopyId);
  }, []);

  return (
    <Layout>
      <Content ref={contentRef}>{children}</Content>
      <CopyLayout>
        {hasJustCopied ? (
          <CopySuccess>
            <CopyIcon>
              <CheckIcon />
            </CopyIcon>
          </CopySuccess>
        ) : (
          <CopyButton onClick={onCopyButtonClick}>
            <CopyIcon>
              <ClipboardIcon />
            </CopyIcon>
          </CopyButton>
        )}
      </CopyLayout>
    </Layout>
  );
};
