import type { HttpSecurityScheme, IHttpOperation } from '@stoplight/types';
import type { Collection, CollectionDefinition, Item, RequestAuth, Url } from 'postman-collection';

import { mergeOperations, mergeResponses } from '../merge';
import { transformRequest } from './transformers/request';
import { transformResponse } from './transformers/response';
import {
  isPostmanSecuritySchemeEqual,
  PostmanSecurityScheme,
  transformSecurityScheme,
  transformSecuritySchemes,
} from './transformers/securityScheme';
import { transformServer } from './transformers/server';
import type { PostmanCollectionHttpOperationTransformer } from './types';
import { resolveCollection, transformDescriptionDefinition } from './util';

export const transformPostmanCollectionOperations = (document: CollectionDefinition): IHttpOperation[] => {
  const collection = resolveCollection(document);
  const securitySchemes = transformSecuritySchemes(collection);
  let operations: IHttpOperation[] = [];

  collection.forEachItem(item => {
    operations = mergeOperations(operations, [transformItem(item, securitySchemes)]);
  });

  return operations;
};

export const transformPostmanCollectionOperation: PostmanCollectionHttpOperationTransformer = ({
  document,
  path,
  method,
}) => {
  const collection = resolveCollection(document);

  const item = findItem(collection, method, path);
  if (!item) {
    throw new Error(`Unable to find "${method} ${path}"`);
  }

  return transformItem(item, transformSecuritySchemes(collection));
};

function transformItem(item: Item, securitySchemes: PostmanSecurityScheme[]): IHttpOperation {
  const auth = item.getAuth();
  const postmanSecurity = auth && findPostmanSecurityScheme(auth, securitySchemes);
  const request = transformRequest(item.request);
  const security: HttpSecurityScheme[][] = [];

  if (postmanSecurity) {
    switch (postmanSecurity.type) {
      case 'securityScheme':
        security.push([postmanSecurity.securityScheme]);
        break;
      case 'headerParams':
        request.headers.push(...postmanSecurity.headerParams);
        break;
      case 'queryParams':
        request.query.push(...postmanSecurity.queryParams);
        break;
    }
  }

  const server = transformServer(item.request.url);

  return {
    id: '?http-operation-id?',
    iid: item.id,
    description: item.description && transformDescriptionDefinition(item.description),
    method: item.request.method.toLowerCase(),
    path: getPath(item.request.url),
    summary: item.name,
    request,
    responses: item.responses.all().reduce<IHttpOperation['responses']>(
      (merged, response) => mergeResponses(merged, [transformResponse(response)]),
      [] as any, // this overrides the NonEmptyArray type on IHttpOperation.responses
    ),
    security,
    servers: server ? [server] : undefined,
  };
}

function findItem(collection: Collection, method: string, path: string): Item | undefined {
  let found;

  collection.forEachItem(item => {
    if (
      item.request.method.toLowerCase() === method.toLowerCase() &&
      getPath(item.request.url).toLowerCase() === path.toLowerCase()
    ) {
      found = item;
    }
  });

  return found;
}

// this func ensures that both this securityScheme and the one in HttpService share exactly the sme keys
function findPostmanSecurityScheme(auth: RequestAuth, securitySchemes: PostmanSecurityScheme[]) {
  const securityScheme = transformSecurityScheme(auth, () => '1');
  if (!securityScheme) return;

  return securitySchemes.find(ss => isPostmanSecuritySchemeEqual(ss, securityScheme));
}

function getPath(url: Url) {
  return url.path
    ? '/' + url.path.map(segment => (segment.startsWith(':') ? `{${segment.substring(1)}}` : segment)).join('/')
    : '/';
}
