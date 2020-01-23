import {
  HttpParamStyles,
  IHttpHeaderParam,
  IHttpOperationRequestBody,
  IHttpParam,
  IHttpPathParam,
  IHttpQueryParam,
  IMediaTypeContent,
} from '@stoplight/types';
import { JSONSchema4 } from 'json-schema';
import {
  Collection,
  DescriptionDefinition,
  FormParam,
  HeaderDefinition,
  HeaderList,
  Item,
  ItemGroup,
  PropertyList,
  QueryParam,
  RequestBody,
  Url,
} from 'postman-collection';
import * as toJsonSchema from 'to-json-schema';
import { JSONSchema3or4 } from 'to-json-schema';
import { PostmanCollectionHttpOperationTransformer } from './types';
import { traverseItemsAndGroups } from './util';

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

function transformDescriptionDefinition(description: string | DescriptionDefinition) {
  return typeof description === 'string' ? description : description.content;
}

function transformQueryParam(queryParam: QueryParam): IHttpQueryParam {
  return {
    name: queryParam.key as string, // no key no game
    style: HttpParamStyles.Form,
    ...(queryParam.value ? transformValueToHttpParam(queryParam.value) : undefined),
  };
}

function transformHeader(header: HeaderDefinition): IHttpHeaderParam {
  return {
    name: header.key as string,
    style: HttpParamStyles.Simple,
    ...(header.value ? transformValueToHttpParam(header.value) : undefined),
  };
}

function transformPathParams(segments: string[]): IHttpPathParam[] {
  return segments.reduce<IHttpHeaderParam[]>((params, segment) => {
    if (segment.startsWith(':')) {
      params.push({
        name: segment.substring(1),
        style: HttpParamStyles.Simple,
      });
    }

    return params;
  }, []);
}

function transformBody(body: RequestBody, mediaType?: string): IHttpOperationRequestBody | undefined {
  switch (body.mode) {
    case 'raw':
      if (!body.raw) return;
      return { contents: [transformRawBody(body.raw, mediaType)] };

    case 'formdata':
      if (!body.formdata) return;
      return {
        contents: [transformParamsBody<FormParam>(body.formdata, mediaType || 'multipart/form-data')],
      };

    case 'urlencoded':
      if (!body.urlencoded) return;
      return {
        contents: [transformParamsBody<QueryParam>(body.urlencoded, mediaType || 'application/x-www-form-urlencoded')],
      };
  }

  return;
}

function transformRawBody(raw: string, mediaType?: string): IMediaTypeContent {
  try {
    const parsed = JSON.parse(raw);

    return {
      mediaType: mediaType || 'application/json',
      examples: [
        {
          key: 'default',
          value: parsed,
        },
      ],
      schema: toJsonSchema(parsed, {
        postProcessFnc: (type, schema, value) => {
          const schemaFromTemplate = transformValueTemplateToSchema(value);
          return (schemaFromTemplate ? schemaFromTemplate : schema) as JSONSchema3or4;
        },
      }) as JSONSchema4,
    };
  } catch (e) {
    /* noop */
  }

  return {
    mediaType: mediaType || 'text/plain',
    examples: [
      {
        key: 'default',
        value: raw,
      },
    ],
  };
}

function transformParamsBody<T extends FormParam | QueryParam>(
  params: PropertyList<T>,
  mediaType: string,
): IMediaTypeContent {
  return {
    mediaType,
    schema: {
      type: 'object',
      properties: params.all().reduce<NonNullable<JSONSchema4['properties']>>((props, item) => {
        // @todo: !
        props[item.key!] = {
          type: 'string',
          description: item.description && transformDescriptionDefinition(item.description),
        };
        return props;
      }, {}),
    },
    examples: [
      {
        key: 'default',
        value: params.all().reduce((value, item) => {
          // @todo: !
          value[item.key!] = item.value;
          return value;
        }, {}),
      },
    ],
  };
}

function transformValueTemplateToSchema(value: string): JSONSchema4 | undefined {
  switch (value) {
    case '<string>':
      return { type: 'string' };
    case '<long>':
      return { type: 'integer' };
  }

  return;
}

function transformValueToHttpParam(value: string): Pick<IHttpParam, 'schema' | 'examples'> {
  const schema = transformValueTemplateToSchema(value);
  if (schema) return { schema };

  if (/^<.+>$/.test(value)) {
    throw new Error(`Fix me: unknown value template: ${value}`);
  }

  return {
    examples: [
      {
        key: 'default',
        value,
      },
    ],
  };
}

function getPath(url: Url) {
  return '/' + url.path.map(segment => (segment.startsWith(':') ? `{${segment.substring(1)}}` : segment)).join('/');
}
