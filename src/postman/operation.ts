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
import { transformRequest } from './transformers/request';
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

  return {
    id: '?http-operation-id?',
    iid: item.id,
    description: item.description && transformDescriptionDefinition(item.description),
    method,
    path,
    summary: item.name,
    request: transformRequest(item.request),
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

function getPath(url: Url) {
  return '/' + url.path.map(segment => (segment.startsWith(':') ? `{${segment.substring(1)}}` : segment)).join('/');
}
