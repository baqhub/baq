import {DataProvider} from "@baqhub/sdk-react";
import {Column, tw} from "@baqhub/ui/core/style.js";
import {FC, Suspense} from "react";
import {ItemKey} from "../state/homeState.js";
import {Item} from "./item.js";
import {ItemListEmpty} from "./itemListEmpty.js";
import {ItemListLoading} from "./itemListLoading.js";

//
// Props.
//

interface ItemListProps {
  isLoading: boolean;
  getItemKeys: DataProvider<ReadonlyArray<ItemKey>>;
}

//
// Style.
//

const Layout = tw(Column)<{$isLoading: boolean}>`
  py-3
  overflow-auto
  ${p => (p.$isLoading ? "opacity-50 pointer-events-none" : "opacity-100")}
`;

//
// Component.
//

export const ItemList: FC<ItemListProps> = props => {
  const {isLoading, getItemKeys} = props;

  const renderLoading = () => {
    return <ItemListLoading />;
  };

  return (
    <Layout $isLoading={isLoading}>
      <Suspense fallback={renderLoading()}>
        <ItemListContent getItemKeys={getItemKeys} />
      </Suspense>
    </Layout>
  );
};

interface ItemListContentProps {
  getItemKeys: DataProvider<ReadonlyArray<ItemKey>>;
}

const ItemListContent: FC<ItemListContentProps> = ({getItemKeys}) => {
  const itemKeys = getItemKeys();

  if (itemKeys.length === 0) {
    return <ItemListEmpty />;
  }

  const renderItem = (itemKey: ItemKey) => {
    return <Item key={itemKey} itemKey={itemKey} />;
  };

  return <>{itemKeys.map(renderItem)}</>;
};
