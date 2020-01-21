import { Collection, CollectionDefinition, Item, ItemGroup } from 'postman-collection';
import { HttpServiceTransformer } from '../types';
import {
  isSecuritySchemeOutcomeEqual,
  isStandardSecurityScheme,
  SecuritySchemeOutcome,
  transformSecurityScheme,
} from './transformers/securityScheme';
import { traverseItemsAndGroups } from './util';

export const transformPostmanCollectionService: HttpServiceTransformer<CollectionDefinition> = collectionDefinition => {
  const collection = new Collection(collectionDefinition);
  const resolvedCollection = new Collection(collection.toObjectResolved({ variables: collection.variables }, []));

  const securitySchemeOutcomes: SecuritySchemeOutcome[] = [];
  let securitySchemeIdx = 0;

  function addSecurityScheme(outcome: SecuritySchemeOutcome) {
    if (!securitySchemeOutcomes.find(o => isSecuritySchemeOutcomeEqual(o, outcome))) {
      securitySchemeOutcomes.push(outcome);
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
    securitySchemes: securitySchemeOutcomes.filter(isStandardSecurityScheme).map(outcome => outcome.securityScheme),
  };
};
