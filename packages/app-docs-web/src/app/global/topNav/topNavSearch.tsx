"use client";

import {Row, tw} from "@baqhub/ui/core/style.jsx";
import {DocSearchModal, useDocSearchKeyboardEvents} from "@docsearch/react";
import {MagnifyingGlassIcon} from "@heroicons/react/24/outline";
import {FC, useCallback, useState} from "react";
import {createPortal} from "react-dom";

//
// Style.
//

const Layout = tw(Row)`
  shrink-0
  items-center
  gap-2
`;

const Separator = tw.div`
  w-1.5
  h-1.5
  mx-2

  rounded-full
  bg-zinc-300
  dark:bg-zinc-600
`;

const SearchButton = tw.button`
  mx-1.5
  shrink-0
  block
  p-0.5

  text-zinc-700
  dark:text-zinc-200
  hover:text-amber-800
  dark:hover:text-amber-400

`;

const SearchIcon = tw.div`
  w-[21px]
  h-[21px]
`;

//
// Component.
//

export const TopNavSearch: FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  //
  // Event handlers.
  //

  const onOpenClick = useCallback(() => {
    setIsOpen(true);
  }, [setIsOpen]);

  const onCloseClick = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  useDocSearchKeyboardEvents({
    isOpen,
    onOpen: onOpenClick,
    onClose: onCloseClick,
  });

  //
  // Render.
  //

  return (
    <Layout>
      <SearchButton>
        <SearchIcon onClick={onOpenClick}>
          <MagnifyingGlassIcon strokeWidth={2.5} />
        </SearchIcon>
      </SearchButton>
      <Separator />
      {isOpen &&
        createPortal(
          <DocSearchModal
            appId="EZE6CEM2WW"
            apiKey="c7156b9c8ccf0a85901120d20ce0688e"
            indexName="baq"
            initialScrollY={window.scrollY}
            onClose={onCloseClick}
          />,
          document.body
        )}
    </Layout>
  );
};
