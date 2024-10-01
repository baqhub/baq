import {Handler} from "@baqhub/sdk";
import {DataProvider, RendererOf} from "@baqhub/sdk-react";
import {Column, tw} from "@baqhub/ui/core/style.js";
import {PropsWithChildren, useEffect, useRef} from "react";

//
// Props.
//

interface PostsProps<T> extends PropsWithChildren {
  getItems: DataProvider<ReadonlyArray<T>>;
  loadMoreItems: Handler;
  renderItem: RendererOf<T>;
}

//
// Style.
//

const Layout = tw(Column)``;

//
// Component.
//

export function Posts<T>(props: PostsProps<T>) {
  const {getItems, loadMoreItems, renderItem, children} = props;
  const items = getItems();

  //
  // Load more trigger.
  //

  const layoutRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentLayout = layoutRef.current;
    if (!currentLayout) {
      return;
    }

    const onIntersectionChange: IntersectionObserverCallback = entries => {
      const intersectionRatio = entries[0]?.intersectionRatio || 0;
      if (intersectionRatio < 1) {
        return;
      }

      loadMoreItems();
    };

    const observer = new IntersectionObserver(onIntersectionChange, {
      rootMargin: "100000px 0px 200px 0px",
      threshold: 1,
    });

    observer.observe(currentLayout);
    return () => {
      observer.disconnect();
    };
  }, [loadMoreItems]);

  //
  // Render.
  //

  if (items.length === 0) {
    return children;
  }

  return <Layout ref={layoutRef}>{items.map(renderItem)}</Layout>;
}
