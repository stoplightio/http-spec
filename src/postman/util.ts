import { IHttpParam } from '@stoplight/types';
import { JSONSchema4 } from 'json-schema';
import { DescriptionDefinition, Item, ItemGroup } from 'postman-collection';
import * as toJsonSchema from 'to-json-schema';

export function transformValueToSchema(value: string): Pick<IHttpParam, 'schema' | 'examples'> {
  return {
    examples: [
      {
        key: 'default',
        value,
      },
    ],
    schema: toJsonSchema(value) as JSONSchema4,
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
