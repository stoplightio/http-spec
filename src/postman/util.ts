import { Item, ItemGroup } from 'postman-collection';

export function traverseItemsAndGroups(
  itemGroup: ItemGroup<Item>,
  itemCallback: (item: Item) => void,
  itemGroupCallback?: (itemGroup: ItemGroup<Item>) => void,
) {
  itemGroup.forEachItem(itemCallback);
  if (itemGroupCallback) itemGroup.forEachItemGroup(itemGroupCallback);
  itemGroup.forEachItemGroup(ig => traverseItemsAndGroups(ig, itemCallback, itemGroupCallback));
}
