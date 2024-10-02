import {Handler, isDefined} from "@baqhub/sdk";
import {FC, PropsWithChildren, RefObject, useEffect, useRef} from "react";
import {Column} from "./style.js";

//
// Props.
//

interface InfiniteListProps extends PropsWithChildren {
  root?: RefObject<Element>;
  className?: string;
  top?: number;
  bottom?: number;
  loadMore: Handler | undefined;
}

//
// Component.
//

const defaultThreshold = Number.MAX_SAFE_INTEGER;

export const InfiniteList: FC<InfiniteListProps> = props => {
  const {root, className} = props;
  const {top, bottom, loadMore, children} = props;

  //
  // Load more trigger.
  //

  const layoutRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentLayout = layoutRef.current;
    if (!currentLayout || !loadMore) {
      return;
    }

    const onIntersectionChange: IntersectionObserverCallback = entries => {
      const intersectionRatio = entries[0]?.intersectionRatio || 0;
      if (intersectionRatio < 1) {
        return;
      }

      console.log("Calling loadMore()");
      loadMore();
    };

    const topMargin = isDefined(top) ? top : defaultThreshold;
    const bottomMargin = isDefined(bottom) ? bottom : defaultThreshold;

    const observer = new IntersectionObserver(onIntersectionChange, {
      root: root?.current,
      rootMargin: `${topMargin}px 0px ${bottomMargin}px 0px`,
      threshold: 1,
    });

    observer.observe(currentLayout);
    return () => {
      observer.disconnect();
    };
  }, [root, top, bottom, loadMore]);

  //
  // Render.
  //

  return (
    <Column ref={layoutRef} className={className}>
      {children}
    </Column>
  );
};
