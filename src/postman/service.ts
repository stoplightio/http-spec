import { Collection, CollectionDefinition } from 'postman-collection';
import { HttpServiceTransformer } from '../types';
import { isStandardSecurityScheme, transformSecuritySchemes } from './transformers/securityScheme';

export const transformPostmanCollectionService: HttpServiceTransformer<CollectionDefinition> = collectionDefinition => {
  const collection = new Collection(collectionDefinition);
  const resolvedCollection = new Collection(collection.toObjectResolved({ variables: collection.variables }, []));

  return {
    id: resolvedCollection.id,
    name: resolvedCollection.name,
    version: resolvedCollection.version
      ? resolvedCollection.version.string
        ? resolvedCollection.version.string
        : `${resolvedCollection.version.major}.${resolvedCollection.version.minor}.${resolvedCollection.version.patch}-${resolvedCollection.version.prerelease}`
      : '1.0.0',
    description: resolvedCollection.description?.toString(),
    securitySchemes: transformSecuritySchemes(collection)
      .filter(isStandardSecurityScheme)
      .map(pss => pss.securityScheme),
  };
};
