import { IHttpParam } from '@stoplight/types';
import { JSONSchema6 } from 'json-schema';
import { DescriptionDefinition, Item, ItemGroup } from 'postman-collection';
import {
  combineRenderResults,
  InputData,
  jsonInputForTargetLanguage,
  JSONSchemaTargetLanguage,
  quicktypeMultiFileSync,
} from 'quicktype-core';

export function transformValueToHttpParam(value: string): Pick<IHttpParam, 'schema' | 'examples'> {
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

export function inferJSONSchema(json: string): JSONSchema6 | undefined {
  const title = 'InferredJSONSchema';

  const jsonInput = jsonInputForTargetLanguage(new JSONSchemaTargetLanguage());
  jsonInput.addSourceSync({ name: title, samples: [json] });

  const inputData = new InputData();
  inputData.addInput(jsonInput);

  const schemaString = combineRenderResults(
    quicktypeMultiFileSync({ inputData, lang: new JSONSchemaTargetLanguage(), allPropertiesOptional: true }),
  ).lines.join('');

  const schema: JSONSchema6 = JSON.parse(schemaString);
  return schema.definitions && (schema.definitions[title] as JSONSchema6);
}
