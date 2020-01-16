import { Collection, CollectionDefinition, RequestAuth } from 'postman-collection';
import { HttpServiceTransformer } from '../oas/types';

export const transformPostmanCollection: HttpServiceTransformer<CollectionDefinition> = collectionDefinition => {
  const collection = new Collection(collectionDefinition);
  const resolvedCollection = new Collection(collection.toObjectResolved({ variables: collection.variables }, []));

  const itemGroupAuth: RequestAuth[] = [];
  const itemAuth: RequestAuth[] = [];

  resolvedCollection.forEachItemGroup(itemGroup => {
    if (itemGroup.auth) itemGroupAuth.push(itemGroup.auth);
  });
  resolvedCollection.forEachItem(item => {
    if (item.auth) itemAuth.push(item.auth);
  });

  return {
    id: resolvedCollection.id,
    name: resolvedCollection.name,
    version: resolvedCollection.version
      ? resolvedCollection.version.string
        ? resolvedCollection.version.string
        : `${resolvedCollection.version.major}.${resolvedCollection.version.minor}.${resolvedCollection.version.patch}-${resolvedCollection.version.prerelease}`
      : '1.0.0',
    description: resolvedCollection.description?.toString(),
  };
};
