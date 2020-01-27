import {
  HttpParamStyles,
  IHttpHeaderParam,
  IHttpOperationRequestBody,
  IHttpParam,
  IHttpPathParam,
  IHttpQueryParam,
  IMediaTypeContent,
} from '@stoplight/types';
import { Collection, HeaderList, Item, ItemGroup, Url } from 'postman-collection';
import { transformBody, transformHeader, transformPathParams, transformQueryParam } from './transformers/request';
import { PostmanCollectionHttpOperationTransformer } from './types';
import { transformDescriptionDefinition, traverseItemsAndGroups } from './util';

export const transformPostmanCollectionOperation: PostmanCollectionHttpOperationTransformer = ({
  document,
  path,
  method,
}) => {
  const collection = new Collection(document);
  const resolvedCollection = new Collection(collection.toObjectResolved({ variables: collection.variables }, []));

  const item = findItem({ collection: resolvedCollection, method, path });
  if (!item) {
    throw new Error(`Unable to find "${method} ${path}"`);
  }

  const header = item.request.headers.all().map(transformHeader);

  return {
    id: '?http-operation-id?',
    iid: item.id,
    description: item.description && transformDescriptionDefinition(item.description),
    method,
    path,
    summary: item.name,
    request: {
      query: item.request.url.query.all().map(transformQueryParam),
      header,
      path: transformPathParams(item.request.url.path),
      body: item.request.body ? transformBody(item.request.body, findContentType(item.request.headers)) : undefined,
    },
    responses: [],
    /*
    servers: ...,
    security: ...,
    */
  } as any;
};

function findItem({
  method,
  path,
  collection,
}: {
  method: string;
  path: string;
  collection: Collection;
}): Item | undefined {
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

function findContentType(headers: HeaderList) {
  const header = headers.all().find(h => h.key.toLowerCase() === 'content-type');
  return header ? header.value.toLowerCase() : undefined;
}

function getPath(url: Url) {
  return '/' + url.path.map(segment => (segment.startsWith(':') ? `{${segment.substring(1)}}` : segment)).join('/');
}
