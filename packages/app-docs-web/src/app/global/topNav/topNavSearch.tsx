"use client";

import {ButtonRow, Row, tw} from "@baqhub/ui/core/style.jsx";
import {DocSearchModal, useDocSearchKeyboardEvents} from "@docsearch/react";
import {MagnifyingGlassIcon} from "@heroicons/react/24/outline";
import {FC, useCallback, useEffect, useState} from "react";
import {createPortal} from "react-dom";

//
// Style.
//

const Layout = tw(Row)`
  shrink-0
  grow

  justify-end
  lg:justify-start
`;

const SmallSearch = tw(Row)`
  items-center
  sm:gap-2
  lg:hidden
`;

const Separator = tw.div`
  w-1.5
  h-1.5
  mx-2

  rounded-full
  bg-zinc-300
  dark:bg-zinc-600
`;

const SmallSearchButton = tw.button`
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

const LargeSearch = tw(Row)`
  hidden
  lg:flex
  pl-8
`;

const LargeSearchButton = tw(ButtonRow)`
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

const Placeholder = tw(Row)`
  px-1
  py-2
  gap-1.5
  items-center
`;

const PlaceholderSearchIcon = tw.div`
  w-[18px]
  h-[18px]
`;

const PlaceholderSearchText = tw.div`
  text-sm
  pr-6
`;

const SearchKey = tw.div`
  px-1
  py-0.5

  text-[11px]

  rounded
  border
  text-zinc-500
  border-zinc-300
  dark:text-zinc-500
  dark:border-zinc-700
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
