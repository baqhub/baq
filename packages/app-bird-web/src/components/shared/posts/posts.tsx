import {Handler} from "@baqhub/sdk";
import {DataProvider, RendererOf} from "@baqhub/sdk-react";
import {InfiniteList} from "@baqhub/ui/core/infiniteList.js";
import {PropsWithChildren} from "react";
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
// Component.
//

export function Posts<T>(props: PostsProps<T>) {
  const {getItems, renderItem, children} = props;
  const {isLoadingMore, loadMore} = props;
  const items = getItems();

  if (items.length === 0) {
    return children;
  }

  return (
    <InfiniteList loadMore={loadMore} bottom={200}>
      {items.map(renderItem)}
      <LoadingMorePosts isLoading={isLoadingMore} />
    </InfiniteList>
  );
}
