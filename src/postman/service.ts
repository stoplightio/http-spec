import { CollectionDefinition } from 'postman-collection';
import { HttpServiceTransformer } from '../types';
import { isStandardSecurityScheme, transformSecuritySchemes } from './transformers/securityScheme';
import { resolveCollection } from './util';

export const transformPostmanCollectionService: HttpServiceTransformer<CollectionDefinition> = document => {
  const collection = resolveCollection(document);

  return {
    id: collection.id,
    name: collection.name,
    version: collection.version
      ? collection.version.string
        ? collection.version.string
        : `${collection.version.major}.${collection.version.minor}.${collection.version.patch}-${collection.version.prerelease}`
      : '1.0.0',
    description: collection.description?.toString(),
    securitySchemes: transformSecuritySchemes(collection)
      .filter(isStandardSecurityScheme)
      .map(pss => pss.securityScheme),
  };
};
