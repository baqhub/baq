"use client";

import {ButtonRow, Row} from "@baqhub/ui/core/style.jsx";
import {DocSearchModal, useDocSearchKeyboardEvents} from "@docsearch/react";
import {MagnifyingGlassIcon} from "@heroicons/react/24/outline";
import {FC, useCallback, useEffect, useState} from "react";
import {createPortal} from "react-dom";
import tiwi from "tiwi";

//
// Style.
//

const Layout = tiwi(Row)`
  shrink-0
  grow

  justify-end
  lg:justify-start
`;

const SmallSearch = tiwi(Row)`
  items-center
  sm:gap-2
  lg:hidden
`;

const Separator = tiwi.div`
  mx-2
  h-1.5
  w-1.5

  rounded-full
  bg-zinc-300
  dark:bg-zinc-600
`;

const SmallSearchButton = tiwi.button`
  block
  shrink-0

  mx-1.5
  p-0.5

  text-zinc-700
  hover:text-amber-800
  dark:text-zinc-200
  dark:hover:text-amber-400
`;

const SearchIcon = tiwi.div`
  h-[21px]
  w-[21px]
`;

const LargeSearch = tiwi(Row)`
  hidden
  lg:flex
`;

const LargeSearchButton = tiwi(ButtonRow)`
  px-2

  rounded-lg
  items-center

  ring-inset
  ring-1
  bg-zinc-100
  ring-zinc-100
  hover:ring-amber-600
  dark:bg-zinc-900
  dark:ring-zinc-900
  dark:hover:ring-amber-600

  text-zinc-500
  dark:text-zinc-500

  transition-shadow
`;

const Placeholder = tiwi(Row)`
  px-1
  py-2
  gap-1.5
  items-center
`;

const PlaceholderSearchIcon = tiwi.div`
  h-[18px]
  w-[18px]
`;

const PlaceholderSearchText = tiwi.div`
  pr-14
  text-sm
`;

const SearchKey = tiwi.div`
  px-1
  py-0.5
  rounded

  border
  border-zinc-300
  dark:border-zinc-700

  text-[11px]
  text-zinc-500
  dark:text-zinc-500
`;

//
// Component.
//

type Platform = "apple" | "other";

const findPlatform = (): Platform => {
  if (/(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent)) {
    return "apple";
  }

  return "other";
};

const renderSearchKey = (platform: Platform) => {
  switch (platform) {
    case "apple":
      return <SearchKey>⌘K</SearchKey>;

    default:
      return <SearchKey>CTRL+K</SearchKey>;
  }
};

export const TopNavSearch: FC = () => {
  const [platform, setPlatform] = useState<Platform>("apple");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setPlatform(findPlatform());
  }, []);

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
    searchButtonRef: {current: null},
  });

  //
  // Render.
  //

  return (
    <Layout>
      <SmallSearch>
        <SmallSearchButton>
          <SearchIcon onClick={onOpenClick}>
            <MagnifyingGlassIcon strokeWidth={2.5} />
          </SearchIcon>
        </SmallSearchButton>
        <Separator />
      </SmallSearch>
      <LargeSearch>
        <LargeSearchButton onClick={onOpenClick}>
          <Placeholder>
            <PlaceholderSearchIcon>
              <MagnifyingGlassIcon strokeWidth={1.5} />
            </PlaceholderSearchIcon>
            <PlaceholderSearchText>Search</PlaceholderSearchText>
          </Placeholder>
          {renderSearchKey(platform)}
        </LargeSearchButton>
      </LargeSearch>
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
