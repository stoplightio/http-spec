import { Collection, CollectionDefinition, Item, ItemGroup } from 'postman-collection';
import { HttpServiceTransformer } from '../types';
import {
  isPostmanSecuritySchemeEqual,
  isStandardSecurityScheme,
  PostmanSecurityScheme,
  transformSecurityScheme,
} from './transformers/securityScheme';
import { traverseItemsAndGroups } from './util';

export const transformPostmanCollectionService: HttpServiceTransformer<CollectionDefinition> = collectionDefinition => {
  const collection = new Collection(collectionDefinition);
  const resolvedCollection = new Collection(collection.toObjectResolved({ variables: collection.variables }, []));

  const postmanSecuritySchemes: PostmanSecurityScheme[] = [];
  let securitySchemeIdx = 0;

  function addSecurityScheme(pss: PostmanSecurityScheme) {
    if (!postmanSecuritySchemes.find(p => isPostmanSecuritySchemeEqual(p, pss))) {
      postmanSecuritySchemes.push(pss);
    }
  }

  traverseItemsAndGroups(
    (resolvedCollection as unknown) as ItemGroup<Item>,
    item => {
      const auth = item.getAuth();
      if (auth) {
        const transformed = transformSecurityScheme(auth, type => `${type}-${securitySchemeIdx++}`);
        if (transformed) addSecurityScheme(transformed);
      }
    },
    itemGroup => {
      if (itemGroup.auth) {
        const transformed = transformSecurityScheme(itemGroup.auth, type => `${type}-${securitySchemeIdx++}`);
        if (transformed) addSecurityScheme(transformed);
      }
    },
  );

  return {
    id: resolvedCollection.id,
    name: resolvedCollection.name,
    version: resolvedCollection.version
      ? resolvedCollection.version.string
        ? resolvedCollection.version.string
        : `${resolvedCollection.version.major}.${resolvedCollection.version.minor}.${resolvedCollection.version.patch}-${resolvedCollection.version.prerelease}`
      : '1.0.0',
    description: resolvedCollection.description?.toString(),
    securitySchemes: postmanSecuritySchemes.filter(isStandardSecurityScheme).map(pss => pss.securityScheme),
  };
};
