import {DataProvider, RendererOf} from "@baqhub/sdk-react";
import {Column, tw} from "@baqhub/ui/core/style.js";
import {PropsWithChildren} from "react";

//
// Props.
//

interface PostsProps<T> extends PropsWithChildren {
  getItems: DataProvider<ReadonlyArray<T>>;
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
  const {getItems, renderItem, children} = props;
  const items = getItems();

  if (items.length === 0) {
    return children;
  }

  return <Layout>{items.map(renderItem)}</Layout>;
}
