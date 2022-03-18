import type { IHttpParam } from '@stoplight/types';
import { Collection, CollectionDefinition, DescriptionDefinition, Version } from 'postman-collection';

import { generateId } from './id';

export function transformStringValueToSchema(value: string): Pick<IHttpParam, 'schema' | 'examples'> {
  return {
    examples: [
      {
        id: generateId(),
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

export function resolveCollection(collectionDefinition: CollectionDefinition): Collection {
  const collection = new Collection(collectionDefinition);
  return new Collection(collection.toObjectResolved({ variables: collection.variables }, []));
}

export function resolveVersion(version: Version) {
  return version.string ? version.string : `${version.major}.${version.minor}.${version.patch}-${version.prerelease}`;
}
