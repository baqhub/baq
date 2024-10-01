import {Handler} from "@baqhub/sdk";
import {DataProvider, RendererOf} from "@baqhub/sdk-react";
import {Column, tw} from "@baqhub/ui/core/style.js";
import {PropsWithChildren, useEffect, useRef} from "react";
import {LoadingMorePosts} from "./loadingMorePosts.js";

//
// Props.
//

interface PostsProps<T> extends PropsWithChildren {
  getItems: DataProvider<ReadonlyArray<T>>;
  renderItem: RendererOf<T>;
  isLoadingMore: boolean;
  loadMore: Handler | undefined;
}

//
// Style.
//

const Layout = tw(Column)``;

//
// Component.
//

export function Posts<T>(props: PostsProps<T>) {
  const {getItems, renderItem, children} = props;
  const {isLoadingMore, loadMore} = props;
  const items = getItems();

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

    const observer = new IntersectionObserver(onIntersectionChange, {
      rootMargin: "100000px 0px 200px 0px",
      threshold: 1,
    });

    observer.observe(currentLayout);
    return () => {
      observer.disconnect();
    };
  }, [loadMore]);

  //
  // Render.
  //

  if (items.length === 0) {
    return children;
  }

  return (
    <Layout ref={layoutRef}>
      {items.map(renderItem)}
      <LoadingMorePosts isLoading={Boolean(isLoadingMore || loadMore)} />
    </Layout>
  );
}
