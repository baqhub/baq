import {DataProvider, Renderer} from "@baqhub/sdk-react";
import {ReactElement, useCallback, useMemo} from "react";
import {FlatList, ListRenderItemInfo} from "react-native";
import {Column, tw} from "../../helpers/style";

//
// Props.
//

interface PostsProps<T> {
  isLoading: boolean;
  getItems: DataProvider<ReadonlyArray<T>>;
  renderItem: (item: T) => ReactElement;
  renderHeader?: Renderer;
  renderLoading: Renderer;
  renderEmpty: Renderer;
}

//
// Style.
//

const Layout = tw(Column)`
  flex-1
`;

//
// Component.
//

export function Posts<T extends string>(props: PostsProps<T>) {
  const {isLoading, getItems} = props;
  const {renderItem, renderHeader, renderLoading, renderEmpty} = props;

  const [isEmpty, items] = useMemo(() => {
    const items = isLoading ? [] : getItems();
    return [items.length === 0, renderHeader ? [undefined, ...items] : items];
  }, [isLoading, renderHeader, getItems]);

  const renderListItem = (item: ListRenderItemInfo<T | undefined>) => {
    if (!item.item) {
      return <>{renderHeader?.()}</>;
    }

    return renderItem(item.item);
  };

  const renderFooter = useCallback(() => {
    if (isLoading) {
      return renderLoading();
    }

    if (isEmpty) {
      return renderEmpty();
    }

    return null;
  }, [isLoading, isEmpty, renderLoading, renderEmpty]);

  const extraData = useMemo(() => ({renderHeader}), [renderHeader]);

  if (isLoading || isEmpty) {
    return (
      <Layout>
        {renderHeader?.()}
        <Layout>{renderFooter()}</Layout>
      </Layout>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={k => k || "header"}
      renderItem={renderListItem}
      extraData={extraData}
    />
  );
}
