import { IHttpParam } from '@stoplight/types';
import { DescriptionDefinition, Item, ItemGroup } from 'postman-collection';

export function transformStringValueToSchema(value: string): Pick<IHttpParam, 'schema' | 'examples'> {
  return {
    examples: [
      {
        key: 'default',
        value,
      },
    ],
    schema: { type: 'string' },
  };
}

export function transformDescriptionDefinition(description: string | DescriptionDefinition) {
  return typeof description === 'string' ? description : description.content;
}

export function traverseItemsAndGroups(
  itemGroup: ItemGroup<Item>,
  itemCallback: (item: Item) => void,
  itemGroupCallback?: (itemGroup: ItemGroup<Item>) => void,
) {
  itemGroup.forEachItem(itemCallback);
  if (itemGroupCallback) itemGroup.forEachItemGroup(itemGroupCallback);
  itemGroup.forEachItemGroup(ig => traverseItemsAndGroups(ig, itemCallback, itemGroupCallback));
}
