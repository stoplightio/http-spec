import { IHttpParam } from '@stoplight/types';
import { Collection, CollectionDefinition, DescriptionDefinition, Item, ItemGroup } from 'postman-collection';

export function transformValueToSchema(value: string): Pick<IHttpParam, 'schema' | 'examples'> {
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
}

export function resolveCollection(collectionDefinition: CollectionDefinition): Collection {
  const collection = new Collection(collectionDefinition);
  return new Collection(collection.toObjectResolved({ variables: collection.variables }, []));
}
