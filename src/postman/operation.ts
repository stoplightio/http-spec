import {
  HttpParamStyles,
  HttpSecurityScheme,
  IHttpHeaderParam,
  IHttpOperationRequestBody,
  IHttpParam,
  IHttpPathParam,
  IHttpQueryParam,
  IMediaTypeContent,
} from '@stoplight/types';
import { Collection, Item, ItemGroup, RequestAuth, Url } from 'postman-collection';
import { transformRequest } from './transformers/request';
import { transformResponse } from './transformers/response';
import {
  isPostmanSecuritySchemeEqual,
  transformSecurityScheme,
  transformSecuritySchemes,
} from './transformers/securityScheme';
import { PostmanCollectionHttpOperationTransformer } from './types';
import { transformDescriptionDefinition, traverseItemsAndGroups } from './util';

export const transformPostmanCollectionOperation: PostmanCollectionHttpOperationTransformer = ({
  document,
  path,
  method,
}) => {
  const collection = new Collection(document);
  const resolvedCollection = new Collection(collection.toObjectResolved({ variables: collection.variables }, []));

  const item = findItem(resolvedCollection, method, path);
  if (!item) {
    throw new Error(`Unable to find "${method} ${path}"`);
  }

  const auth = item.getAuth();
  const postmanSecurity = auth && findPostmanSecurityScheme(auth, collection);
  const request = transformRequest(item.request);
  const security: HttpSecurityScheme[][] = [];

  if (postmanSecurity) {
    switch (postmanSecurity.type) {
      case 'securityScheme':
        security.push([postmanSecurity.securityScheme]);
        break;
      case 'headerParams':
        request.headers!.push(...postmanSecurity.headerParams);
        break;
      case 'queryParams':
        request.query!.push(...postmanSecurity.queryParams);
        break;
    }
  }

  return {
    id: '?http-operation-id?',
    iid: item.id,
    description: item.description && transformDescriptionDefinition(item.description),
    method,
    path,
    summary: item.name,
    request,
    responses: item.responses.map(transformResponse),
    security,
    /*
    servers: ...,
    */
  };
};

function findItem(collection: Collection, method: string, path: string): Item | undefined {
  let found;

  traverseItemsAndGroups((collection as unknown) as ItemGroup<Item>, item => {
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
function findPostmanSecurityScheme(auth: RequestAuth, collection: Collection) {
  const securityScheme = transformSecurityScheme(auth, () => '1');
  if (!securityScheme) return;

  const allSecuritySchemes = transformSecuritySchemes(collection);
  return allSecuritySchemes.find(ss => isPostmanSecuritySchemeEqual(ss, securityScheme));
}

function getPath(url: Url) {
  return '/' + url.path.map(segment => (segment.startsWith(':') ? `{${segment.substring(1)}}` : segment)).join('/');
}
