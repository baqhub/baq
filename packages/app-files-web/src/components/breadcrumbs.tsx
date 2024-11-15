import {ButtonRow, Row, Text} from "@baqhub/ui/core/style.js";
import {ChevronRightIcon} from "@heroicons/react/20/solid";
import {FC, useDeferredValue} from "react";
import tiwi from "tiwi";
import {useBreadcrumbsState} from "../state/breadcrumbsState.js";

//
// Style.
//

const Layout = tiwi(Row)`
  p-2
  items-center
`;

const PreviousItemText = tiwi(Text)`
  p-1
  text-2xl
  font-semibold
  text-neutral-600
`;

const PreviousItemButtonText = tiwi(PreviousItemText)`
  hover:text-amber-600
  active:text-amber-700
`;

const Separator = tiwi.div`
  w-6
  h-6
  text-neutral-600
`;

const CurrentItem = tiwi(Text)`
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
