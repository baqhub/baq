import {ChevronRightIcon} from "@heroicons/react/20/solid";
import {ButtonRow, Row, Text, tw} from "@baqhub/ui/core/style.js";
import {FC, useDeferredValue} from "react";
import {useBreadcrumbsState} from "../state/breadcrumbsState.js";

//
// Style.
//

const Layout = tw(Row)`
  p-2
  items-center
`;

const PreviousItemText = tw(Text)`
  p-1
  text-2xl
  font-semibold
  text-neutral-600
`;

const PreviousItemButtonText = tw(PreviousItemText)`
  hover:text-amber-600
  active:text-amber-700
`;

const Separator = tw.div`
  w-6
  h-6
  text-neutral-600
`;

const CurrentItem = tw(Text)`
  p-1
  text-2xl
  font-semibold
`;

//
// Component.
//

export const Breadcrumbs: FC = () => {
  const {onPreviousClick, ...breadcrumbsState} = useBreadcrumbsState();
  const deferredState = useDeferredValue(breadcrumbsState);
  const {breadcrumbsCount, parentName, currentName} = deferredState;

  return (
    <Layout>
      {breadcrumbsCount > 1 && (
        <>
          <PreviousItemText>…</PreviousItemText>
          <Separator>
            <ChevronRightIcon />
          </Separator>
        </>
      )}

      {breadcrumbsCount > 0 && (
        <>
          <ButtonRow role="button" onClick={onPreviousClick}>
            <PreviousItemButtonText>
              {parentName || "Files"}
            </PreviousItemButtonText>
          </ButtonRow>
          <Separator>
            <ChevronRightIcon />
          </Separator>
        </>
      )}

      <CurrentItem>{currentName || "Files"}</CurrentItem>
    </Layout>
  );
};
