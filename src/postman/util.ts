import { IHttpParam } from '@stoplight/types';
import { JSONSchema4 } from 'json-schema';
import { DescriptionDefinition, Item, ItemGroup } from 'postman-collection';
import * as toJsonSchema from 'to-json-schema';
import { JSONSchema3or4 } from 'to-json-schema';

export function transformValueTemplateToSchema(value: string): JSONSchema4 | undefined {
  switch (value) {
    case '<string>':
      return { type: 'string' };
    case '<long>':
      return { type: 'integer' };
  }

  return;
}

export function transformValueToHttpParam(value: string): Pick<IHttpParam, 'schema' | 'examples'> {
  const schema = transformValueTemplateToSchema(value);
  if (schema) return { schema };

  if (/^<.+>$/.test(value)) {
    throw new Error(`Fix me: unknown value template: ${value}`);
  }

  return {
    examples: [
      {
        key: 'default',
        value,
      },
    ],
  };
}

export function transformDescriptionDefinition(description: string | DescriptionDefinition) {
  return typeof description === 'string' ? description : description.content;
}

export function transformPostmanTemplate(obj: object) {
  return toJsonSchema(obj, {
    postProcessFnc: (type, schema, value) => {
      const schemaFromTemplate = transformValueTemplateToSchema(value);
      return (schemaFromTemplate ? schemaFromTemplate : schema) as JSONSchema3or4;
    },
  }) as JSONSchema4;
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
