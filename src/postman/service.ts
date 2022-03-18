import type { CollectionDefinition } from 'postman-collection';

import type { HttpServiceTransformer } from '../types';
import { isStandardSecurityScheme, transformSecuritySchemes } from './transformers/securityScheme';
import { resolveCollection, resolveVersion, transformDescriptionDefinition } from './util';

const DEFAULT_VERSION = '1.0.0';

export const transformPostmanCollectionService: HttpServiceTransformer<CollectionDefinition> = document => {
  const collection = resolveCollection(document);

  return {
    id: collection.id,
    name: collection.name,
    version: collection.version ? resolveVersion(collection.version) : DEFAULT_VERSION,
    description: collection.description && transformDescriptionDefinition(collection.description),
    securitySchemes: transformSecuritySchemes(collection)
      .filter(isStandardSecurityScheme)
      .map(pss => pss.securityScheme),
  };
};
